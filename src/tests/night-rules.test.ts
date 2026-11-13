import { describe, it, expect } from "vitest";
import {
  makeRun,
  reducer,
  duration,
  solved,
  commit,
  resultText,
  untilMidnight,
  utcDate,
} from "../night/game/rules";
import {
  readSave,
  writeSave,
  emptySave,
  validRun,
  clearSave,
  KEY,
} from "../night/game/storage";
import { normalize, matchesAnswer, formatError } from "../night/game/answers";
import {
  mysteries,
  mysteryById,
  schedule,
  dailyMystery,
  roomSolutions,
  switchSolutions,
  decode,
  hhmm,
  leverChecksum,
  practiceMysteries,
} from "../night/content/mysteries";
import { validateMysteries } from "../night/content/validate";
import type { Run } from "../night/game/types";
import type { Event } from "../night/game/rules";
const day = "2026-11-13",
  step = (r: Run, e: Event) => reducer(r, e)!;
const begin = (id = mysteries[0].id) =>
  step(step(makeRun("daily", day, id), { type: "BEGIN" }), { type: "ARRIVE" });
const values = (r: Run) =>
  mysteryById[r.mysteryId].clues[r.clue].fields.map((f) => f.answer);
function correct(r: Run) {
  r = step(step(r, { type: "BEGIN" }), { type: "ARRIVE" });
  return step(r, { type: "ANSWER", values: values(r) });
}
function complete(id = mysteries[0].id) {
  const m = mysteryById[id];
  let r = makeRun(m.number === 0 ? "practice" : "daily", m.date, id);
  for (let i = 0; i < 8; i++) {
    r = correct(r);
    r = step(r, { type: "NEXT" });
  }
  return r;
}
describe("the chase and typed deductions", () => {
  it("opens with an untimed introduction, then walking, then answering", () => {
    const r = makeRun("daily", day);
    expect(r.phase).toBe("intro");
    expect(step(r, { type: "TICK", elapsed: 99999 })).toBe(r);
    expect(step(r, { type: "ARRIVE" })).toBe(r);
    expect(begin().phase).toBe("answering");
  });
  it("only active answering spends monotonic elapsed time", () => {
    let r = begin();
    r = step(r, { type: "TICK", elapsed: 183.25 });
    expect(r.remaining).toBe(duration(r) - 183.25);
    r = step(r, { type: "PAUSE" });
    expect(step(r, { type: "TICK", elapsed: 5000 })).toBe(r);
    expect(step(r, { type: "ANSWER", values: values(r) })).toBe(r);
  });
  it("requires every field, so guessing the witness alone cannot pass", () => {
    const r = begin();
    expect(step(r, { type: "ANSWER", values: [values(r)[0]] })).toBe(r);
    const wrong = step(r, { type: "ANSWER", values: [values(r)[0], "WRONG"] });
    expect(wrong.phase).toBe("answering");
    expect(wrong.score).toBe(0);
  });
  it("banishes and scores exactly once", () => {
    const r = correct(makeRun("daily", day));
    expect(r.phase).toBe("banished");
    expect(r.score).toBe(100);
    expect(step(r, { type: "ANSWER", values: values(r) })).toBe(r);
    expect(step(r, { type: "TICK", elapsed: 99999 })).toBe(r);
  });
  it("wrong complete deductions cost 35 percent and normalized repeats are free", () => {
    let r = begin();
    const first = step(r, { type: "ANSWER", values: ["9999", "WRONG"] });
    expect(first.remaining).toBe(duration(r) - Math.round(duration(r) * 0.35));
    expect(step(first, { type: "ANSWER", values: ["09999", " wrong "] })).toBe(
      first,
    );
  });
  it("three distinct wrong deductions are fatal", () => {
    let r = begin();
    for (let i = 0; i < 3; i++)
      r = step(r, { type: "ANSWER", values: [String(9000 + i), "WRONG"] });
    expect(r.phase).toBe("caught");
    expect(r.remaining).toBe(0);
    expect(validRun(r)).toBe(true);
  });
  it("incomplete, oversized and malformed submissions never cost a penalty", () => {
    const r = begin();
    for (const v of [[], ["", ""], ["oops", "ASH"], ["1", "X".repeat(81)]])
      expect(step(r, { type: "ANSWER", values: v })).toBe(r);
  });
  it("timeout resolves before any late answer", () => {
    const r = step(begin(), { type: "TICK", elapsed: 999999 });
    expect(r.phase).toBe("caught");
    expect(step(r, { type: "ANSWER", values: values(r) })).toBe(r);
    expect(r.score).toBe(0);
  });
  it("cannot skip an unanswered page", () => {
    const r = begin();
    expect(step(r, { type: "NEXT" })).toBe(r);
  });
  it("eight solved pages escape with 3600 points", () => {
    const r = complete();
    expect(r.phase).toBe("escaped");
    expect(r.score).toBe(3600);
    expect(solved(r)).toBe(8);
    expect(validRun(r)).toBe(true);
  });
  it("ignores invalid elapsed time", () => {
    const r = begin();
    for (const elapsed of [NaN, Infinity, -1, 0])
      expect(step(r, { type: "TICK", elapsed })).toBe(r);
  });
  it("scores progress rather than typing speed", () => {
    const fast = correct(begin()),
      slow = correct(step(begin(), { type: "TICK", elapsed: 20000 }));
    expect(fast.score).toBe(slow.score);
  });
});
describe("calendar and answer integrity", () => {
  it("schedules 100 consecutive unique dates and 800 complete puzzles", () => {
    expect(validateMysteries()).toEqual([]);
    expect(schedule).toHaveLength(100);
    expect(mysteries.flatMap((m) => m.clues)).toHaveLength(800);
    expect(schedule[0].date).toBe(day);
    expect(schedule.at(-1)!.date).toBe("2027-02-20");
  });
  it("does not loop after seven days or silently recycle an expired season", () => {
    expect(dailyMystery(day)?.id).not.toBe(dailyMystery("2026-11-20")?.id);
    expect(dailyMystery("2027-02-21")).toBeUndefined();
    expect(() => makeRun("daily", "2027-02-21")).toThrow("No case");
  });
  it("every generated solution is unique and accepted", () => {
    for (const m of mysteries)
      for (const c of m.clues) {
        expect(c.solutions, c.id).toHaveLength(1);
        expect(matchesAnswer(c, c.solutions[0]), c.id).toBe(true);
      }
  });
  it("completes all 100 cases with authored deductions", () => {
    for (const m of mysteries) {
      const r = complete(m.id);
      expect(r.phase).toBe("escaped");
      expect(validRun(r), m.id).toBe(true);
    }
  });
  it("validates the clock prose independently in every case", () => {
    for (const m of mysteries) {
      const c = m.clues[1],
        match = c.evidence.match(
          /displays (\d\d):(\d\d).*?runs (\d+) minutes (fast|slow).*?exactly (\d+) real/s,
        )!;
      const actual =
        Number(match[1]) * 60 +
        Number(match[2]) -
        Number(match[3]) * (match[4] === "fast" ? 1 : -1) -
        Number(match[5]);
      expect(c.fields[0].answer).toBe(hhmm(actual));
    }
  });
  it("verifies representative combinatoric and state mechanisms independently", () => {
    expect(roomSolutions(["Ada", "Bo", "Cy", "Dee"])).toEqual([
      ["Dee", "Ada", "Bo", "Cy"],
    ]);
    expect(switchSolutions(["A", "B", "C", "D", "E"])).toEqual(["B+C"]);
    expect(switchSolutions(["A", "B", "C", "D", "E"], 3)).toEqual(["A+D+E"]);
    expect(decode("NJPSWY", 2, 5)).toBe("TUNNEL");
    expect(leverChecksum([1, 2, 1, 3, 2])).toBe(4);
  });
  it("solves route prose independently using graph traversal", () => {
    for (const m of mysteries) {
      const clue = m.clues[4];
      const edges = [
        ...clue.evidence.matchAll(/([A-C])→([B-CX]) (\d+) min/g),
      ].map((match) => ({
        from: match[1],
        to: match[2],
        minutes: Number(match[3]),
      }));
      const walks = (
        at: string,
        path: string[],
        time: number,
      ): { path: string; time: number }[] =>
        at === "X"
          ? [{ path: path.join("-"), time }]
          : edges
              .filter((e) => e.from === at && !path.includes(e.to))
              .flatMap((e) => walks(e.to, [...path, e.to], time + e.minutes));
      const [h, mins] = m.clues[1].fields[0].answer.split(":").map(Number),
        event = h * 60 + mins;
      const solutions = [
        ...clue.evidence.matchAll(/(\w+) left ([A-C]) at (\d\d):(\d\d)/g),
      ].flatMap((log) =>
        walks(log[2], [log[2]], 0)
          .filter(
            (w) =>
              (Number(log[3]) * 60 + Number(log[4]) + w.time) % 1440 === event,
          )
          .map((w) => [log[1], w.path]),
      );
      expect(solutions, m.id).toEqual([clue.fields.map((f) => f.answer)]);
    }
  });
  it("recovers the unknown tray without assuming its weight", () => {
    for (const m of mysteries.filter(
      (m) => m.clues[6].mechanism === "paired-weight-equations",
    )) {
      const c = m.clues[6],
        readings = [...c.evidence.matchAll(/tray: (\d+) kg/g)].map((m) =>
          Number(m[1]),
        );
      const [ab, bc, ac, abc] = readings,
        tare = ab + bc + ac - 2 * abc;
      expect(c.fields.map((f) => f.answer)).toEqual([
        String(tare),
        String((ab + ac - bc - tare) / 2),
        String((bc + ac - ab - tare) / 2),
      ]);
    }
  });
  it("changes Daily exactly at midnight UTC, across year and leap boundaries", () => {
    expect(untilMidnight(new Date("2026-11-13T23:59:59.500Z"))).toBe(500);
    expect(utcDate(new Date("2026-11-14T01:00:00+01:00"))).toBe("2026-11-14");
    expect(untilMidnight(new Date("2028-02-29T23:59:59Z"))).toBe(1000);
    expect(untilMidnight(new Date("2026-12-31T23:59:59Z"))).toBe(1000);
  });
  it("does not mutate content or Daily when starting practice", () => {
    const bank = JSON.stringify(mysteries);
    const r = makeRun("practice", day, practiceMysteries[0].id);
    expect(commit(emptySave(), r).daily).toEqual({});
    expect(JSON.stringify(mysteries)).toBe(bank);
  });
  it("keeps the original run date over midnight", () => {
    const r = complete();
    expect(commit(emptySave(), r).daily[day].date).toBe(day);
  });
  it("accepts harmless case, time separator, spacing, number and set order variations", () => {
    expect(normalize("  b + a ", "set")).toBe("AB");
    expect(normalize("01:05", "time")).toBe(normalize("0105", "time"));
    expect(normalize("1:05", "time")).toBe("0105");
    expect(normalize("B→C→X", "code")).toBe(normalize("B-C-X", "code"));
    expect(normalize(" 0 1:05 ", "time")).toBe("0105");
    expect(normalize("007", "number")).toBe("7");
    const r = begin();
    expect(
      matchesAnswer(
        mysteryById[r.mysteryId].clues[0],
        values(r).map((v) => ` ${v.toLowerCase()} `),
      ),
    ).toBe(true);
  });
  it("does not discard repeated switch letters, so malformed proofs cannot match", () => {
    expect(normalize("A+A+B", "set")).not.toBe(normalize("A+B", "set"));
  });
  it("provides useful time-format errors without guessing a time", () => {
    const f = mysteries[0].clues[1].fields[0];
    expect(formatError("25:60", f)).toContain("24-hour");
    expect(formatError("13:05", f)).toBe("");
  });
});
describe("tutorial and local recovery", () => {
  it("has an untimed first lesson, then a real chase and two-page finish", () => {
    let r = step(makeRun("tutorial", day), { type: "ARRIVE" });
    for (let i = 0; i < 4; i++)
      r = step(r, { type: "ANSWER", values: [String(900 + i), "WRONG"] });
    expect(r.phase).toBe("answering");
    expect(r.remaining).toBe(duration(r));
    const safe = r;
    expect(step(r, { type: "TICK", elapsed: 999999 })).toBe(safe);
    r = step(correct(r), { type: "NEXT" });
    r = step(r, { type: "ARRIVE" });
    expect(step(r, { type: "TICK", elapsed: 1000 }).remaining).toBe(
      duration(r) - 1000,
    );
    r = step(correct(r), { type: "NEXT" });
    expect(r.phase).toBe("escaped");
    expect(r.score).toBe(0);
    const saved = commit(emptySave(), r);
    expect(saved.tutorialComplete).toBe(true);
    expect(saved.best).toBe(0);
    expect(saved.daily).toEqual({});
    expect(validRun(r)).toBe(true);
  });
  it("does not replace an existing Daily record with a tutorial", () => {
    const daily = correct(begin());
    let save = commit(emptySave(), daily);
    save = commit(save, makeRun("tutorial", day));
    expect(save.daily[day]).toEqual(daily);
  });
  it("persists submitted facts, penalties, score and paused recovery", () => {
    const r = correct(begin()),
      save = commit(emptySave(), r);
    expect(writeSave(save)).toBe(true);
    expect(readSave().save.active).toEqual({ ...r, paused: true });
  });
  it("guards throwing storage getters and methods", () => {
    expect(
      writeSave(emptySave(), {
        setItem() {
          throw Error();
        },
      }),
    ).toBe(false);
    expect(
      readSave({
        getItem() {
          throw new DOMException("blocked", "SecurityError");
        },
      }).message,
    ).toContain("cannot be saved");
    expect(
      clearSave({
        removeItem() {
          throw Error();
        },
      }),
    ).toBe(false);
  });
  it.each(["{", "null", '{"version":999}', '{"version":3}'])(
    "recovers damaged or unsupported saves: %s",
    (raw) => {
      expect(readSave({ getItem: () => raw }).message).not.toBe("");
    },
  );
  it("preserves valid records while dropping damaged ones", () => {
    const good = complete(),
      bad = { ...good, score: 9999 };
    const raw = {
      ...emptySave(),
      daily: { [day]: good, "2026-11-14": bad },
      preferences: { sound: true, motion: "reduced" },
    };
    const out = readSave({ getItem: () => JSON.stringify(raw) });
    expect(out.save.daily[day].score).toBe(3600);
    expect(out.save.daily["2026-11-14"]).toBeUndefined();
    expect(out.save.preferences.sound).toBe(true);
    expect(out.message).toContain("damaged run");
  });
  it("migrates preferences only from v3, separating old bank scores", () => {
    const old = {
      version: 3,
      preferences: { sound: true, motion: "reduced" },
      best: 3600,
    };
    const out = readSave({
      getItem: (key) => (key.endsWith("v3") ? JSON.stringify(old) : null),
    });
    expect(out.save.preferences).toEqual(old.preferences);
    expect(out.save.best).toBe(0);
    expect(out.save.active).toBeNull();
  });
  it("resets only v4, preserving legacy and unrelated storage", () => {
    localStorage.setItem("other", "keep");
    localStorage.setItem("dead-letter:night-walk:v3", "archived");
    writeSave(emptySave());
    clearSave();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(localStorage.getItem("other")).toBe("keep");
    expect(localStorage.getItem("dead-letter:night-walk:v3")).toBe("archived");
  });
  it("rejects tampered typed answers or impossible state", () => {
    const r = correct(begin());
    expect(
      validRun({
        ...r,
        answers: r.answers.map((a) => ({ ...a, values: ["WRONG"] })),
      }),
    ).toBe(false);
    expect(validRun({ ...r, clue: 8 })).toBe(false);
    expect(validRun({ ...r, remaining: -1 })).toBe(false);
  });
  it("shares progress without puzzle spoilers", () => {
    const text = resultText(complete());
    expect(text).toContain("8/8 clues");
    expect(text).toContain("3600");
    expect(text).not.toContain(mysteries[0].clues[0].evidence);
  });
});
it("keeps painted sprite edges apart until zero chase distance", async () => {
  const { contactOffset, ghostPosition } = await import("../night/art/sprites");
  for (const dy of [1, 2, 3, 4, 5])
    for (const reduced of [false, true]) {
      const contact = 200 + contactOffset(dy);
      expect(ghostPosition(200, 0, dy, reduced)).toBe(contact);
      for (const gap of [0.01, 0.4, 1, 7.9, 8, 32, 120])
        expect(ghostPosition(200, gap, dy, reduced)).toBeLessThan(contact);
    }
});

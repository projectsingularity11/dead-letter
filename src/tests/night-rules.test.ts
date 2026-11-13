import { describe, it, expect } from "vitest";
import {
  makeRun,
  reducer,
  duration,
  solved,
  commit,
  resultText,
} from "../night/game/rules";
import {
  readSave,
  writeSave,
  emptySave,
  validRun,
  clearSave,
  KEY,
} from "../night/game/storage";
import type { Run } from "../night/game/types";
import type { Event } from "../night/game/rules";
import { mysteries, mysteryById } from "../night/content/mysteries";
import { validateMysteries } from "../night/content/validate";
const step = (r: Run, e: Event) => reducer(r, e)!;
function correct(r: Run) {
  r = step(r, { type: "ARRIVE" });
  return step(r, {
    type: "ANSWER",
    choiceId: mysteryById[r.mysteryId].clues[r.clue].answerId,
  });
}
function complete(id = mysteries[0].id) {
  let r = makeRun("daily", "2026-11-11", id);
  for (let i = 0; i < 8; i++) {
    r = correct(r);
    r = step(r, { type: "NEXT" });
  }
  return r;
}
describe("the chase", () => {
  it("starts with a walk and a full countdown", () => {
    const r = makeRun();
    expect(r.phase).toBe("walking");
    expect(r.remaining).toBe(duration(r));
    expect(step(r, { type: "TICK", elapsed: 60000 })).toBe(r);
  });
  it("only active answering spends time", () => {
    let r = step(makeRun(), { type: "ARRIVE" });
    r = step(r, { type: "TICK", elapsed: 183.25 });
    expect(r.remaining).toBe(duration(r) - 183.25);
    r = step(r, { type: "PAUSE" });
    expect(step(r, { type: "TICK", elapsed: 5000 }).remaining).toBe(
      r.remaining,
    );
    expect(
      step(r, {
        type: "ANSWER",
        choiceId: mysteryById[r.mysteryId].clues[0].answerId,
      }),
    ).toBe(r);
  });
  it("correct answers banish, commit once and award progression points", () => {
    const r = correct(makeRun());
    expect(r.phase).toBe("banished");
    expect(r.score).toBe(100);
    expect(step(r, { type: "ANSWER", choiceId: r.answers[0].choiceId })).toBe(
      r,
    );
    expect(step(r, { type: "TICK", elapsed: 99999 })).toBe(r);
  });
  it("a wrong answer loses35 percent and cannot be charged twice", () => {
    let r = step(makeRun(), { type: "ARRIVE" });
    const c = mysteryById[r.mysteryId].clues[0],
      id = c.choices.find((o) => o.id !== c.answerId)!.id;
    r = step(r, { type: "ANSWER", choiceId: id });
    expect(r.remaining).toBe(duration(r) - Math.round(duration(r) * 0.35));
    expect(r.score).toBe(0);
    expect(step(r, { type: "ANSWER", choiceId: id })).toBe(r);
  });
  it("three distinct wrong choices are fatal, with no negative distance", () => {
    let r = step(makeRun(), { type: "ARRIVE" });
    const c = mysteryById[r.mysteryId].clues[0];
    for (const choice of c.choices.filter((o) => o.id !== c.answerId))
      r = step(r, { type: "ANSWER", choiceId: choice.id });
    expect(r.phase).toBe("caught");
    expect(r.remaining).toBe(0);
    expect(r.answers).toHaveLength(3);
  });
  it("timeout resolves before any subsequent answer and cannot score", () => {
    let r = step(makeRun(), { type: "ARRIVE" });
    r = step(r, { type: "TICK", elapsed: duration(r) + 1 });
    expect(r.phase).toBe("caught");
    expect(
      step(r, {
        type: "ANSWER",
        choiceId: mysteryById[r.mysteryId].clues[0].answerId,
      }),
    ).toBe(r);
    expect(r.score).toBe(0);
  });
  it("Next cannot skip an unanswered clue", () => {
    const r = step(makeRun(), { type: "ARRIVE" });
    expect(step(r, { type: "NEXT" })).toBe(r);
  });
  it("eight solved clues escape with3600 points, independent of speed", () => {
    const r = complete();
    expect(r.phase).toBe("escaped");
    expect(r.score).toBe(3600);
    expect(solved(r)).toBe(8);
    expect(validRun(r)).toBe(true);
    expect(step(r, { type: "NEXT" })).toBe(r);
  });
  it("run progress, not speed, determines the score", () => {
    let r = step(makeRun(), { type: "ARRIVE" });
    r = step(r, { type: "TICK", elapsed: 20000 });
    r = correct(r);
    expect(r.score).toBe(correct(makeRun()).score);
  });
  it("invalid choice IDs and invalid elapsed time do nothing", () => {
    const r = step(makeRun(), { type: "ARRIVE" });
    expect(step(r, { type: "ANSWER", choiceId: "bad" })).toBe(r);
    expect(step(r, { type: "TICK", elapsed: NaN })).toBe(r);
    expect(step(r, { type: "TICK", elapsed: -1 })).toBe(r);
  });
});
describe("daily and local recovery", () => {
  it("same UTC date gives same mystery and exact option order", () => {
    expect(makeRun("daily", "2026-11-11")).toEqual(
      makeRun("daily", "2026-11-11"),
    );
    expect(makeRun("daily", "2026-11-12").mysteryId).not.toBe(
      makeRun("daily", "2026-11-11").mysteryId,
    );
  });
  it("seven consecutive dates rotate through seven mysteries", () => {
    expect(
      new Set(
        Array.from(
          { length: 7 },
          (_, i) => makeRun("daily", `2026-11-${11 + i}`).mysteryId,
        ),
      ).size,
    ).toBe(7);
  });
  it("practice uses fresh seeds without mutating content", () => {
    const bank = JSON.stringify(mysteries);
    expect(makeRun("practice").id).not.toBe(makeRun("practice").id);
    expect(JSON.stringify(mysteries)).toBe(bank);
  });
  it("persists current answer, misses, option order, score and clock", () => {
    let r = correct(makeRun());
    const state = commit(emptySave(), r);
    expect(writeSave(state)).toBe(true);
    const read = readSave();
    expect(read.message).toBe("");
    expect(read.save.active).toEqual({ ...r, paused: true });
    expect(validRun(read.save.active)).toBe(true);
  });
  it("guards missing storage and throwing storage methods", () => {
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
  it("recovers invalid runs without discarding other dates or preferences", () => {
    const good = complete(),
      bad = { ...good, score: 9999 };
    const input = {
      ...emptySave(),
      daily: { "2026-11-11": good, "2026-11-12": bad },
      preferences: { sound: true, motion: "reduced" },
    };
    const read = readSave({ getItem: () => JSON.stringify(input) });
    expect(read.save.daily["2026-11-11"].score).toBe(3600);
    expect(read.save.daily["2026-11-12"]).toBeUndefined();
    expect(read.save.preferences.sound).toBe(true);
    expect(read.message).toContain("damaged run");
  });
  it.each(["{", "null", '{"version":999}', '{"version":2}'])(
    "recovers corrupt or unsupported saves %s",
    (raw) => expect(readSave({ getItem: () => raw }).message).not.toBe(""),
  );
  it("keeps the original Daily date across midnight", () => {
    const r = complete();
    const state = commit(emptySave(), r);
    expect(state.daily["2026-11-11"].date).toBe("2026-11-11");
    expect(state.daily["2026-11-12"]).toBeUndefined();
  });
  it("resets only v3; legacy and unrelated keys remain", () => {
    localStorage.setItem("other", "keep");
    localStorage.setItem("dead-letter:records", "legacy");
    writeSave(emptySave());
    clearSave();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(localStorage.getItem("other")).toBe("keep");
    expect(localStorage.getItem("dead-letter:records")).toBe("legacy");
  });
  it("result sharing contains outcomes, never question spoilers", () => {
    const r = complete();
    const text = resultText(r);
    expect(text).toContain("8/8 clues");
    expect(text).toContain("3600");
    expect(text).not.toContain(mysteryById[r.mysteryId].clues[0].evidence);
  });
});
describe("mystery answer integrity", () => {
  it("has56 complete ordered clues", () => {
    expect(validateMysteries()).toEqual([]);
    expect(mysteries.flatMap((m) => m.clues)).toHaveLength(56);
  });
  it("every mystery completes with its authored correct IDs", () => {
    for (const m of mysteries) {
      const r = complete(m.id);
      expect(r.phase).toBe("escaped");
      expect(validRun(r)).toBe(true);
    }
  });
  it("proves a unique answer for every authored clue", async () => {
    const { solutionAudits } = await import("../night/content/mysteries");
    expect(solutionAudits).toHaveLength(56);
    for (const audit of solutionAudits) {
      expect(audit.candidates, audit.id).toEqual([audit.answer]);
      const clue = mysteries
        .flatMap((m) => m.clues)
        .find((c) => c.id === audit.id)!;
      expect(clue.choices.find((c) => c.id === clue.answerId)?.text).toBe(
        audit.answer,
      );
    }
  });
  it("solves the train deductions independently", async () => {
    const { roomSolutions, switchSolutions, decode, leverChecksum, hhmm } =
      await import("../night/content/mysteries");
    expect(roomSolutions(["Ada", "Bo", "Cy", "Dee"])).toEqual([
      ["Dee", "Ada", "Bo", "Cy"],
    ]);
    expect(switchSolutions(["A", "B", "C", "D", "E"])).toEqual(["B+C"]);
    expect(hhmm(163 - 17 - 9)).toBe("02:17");
    expect(leverChecksum([1, 2, 1, 3, 2])).toBe(4);
    const cipher = mysteries[0].clues[3].evidence.match(/reads ([A-Z]{6})/)![1];
    expect(decode(cipher, 2, 5)).toBe("TUNNEL");
    expect(
      mysteries[0].clues[4].choices.find(
        (o) => o.id === mysteries[0].clues[4].answerId,
      )?.text,
    ).toBe("Bo");
    expect(
      mysteries[0].clues[7].choices.find(
        (o) => o.id === mysteries[0].clues[7].answerId,
      )?.text,
    ).toBe("F/02:17/B/TU/B+C/4");
  });
  it("imports only preferences from the easier archived bank", () => {
    const old = {
      version: 2,
      preferences: { sound: true, motion: "reduced" },
      best: 3600,
    };
    const read = readSave({
      getItem: (key) => (key.endsWith("v2") ? JSON.stringify(old) : null),
    });
    expect(read.save.preferences.sound).toBe(true);
    expect(read.save.active).toBeNull();
    expect(read.save.best).toBe(0);
  });
});

describe("pixel contact matches the chase clock", () => {
  it("keeps painted edges apart for every positive gap and touches only at zero", async () => {
    const { contactOffset, ghostPosition } =
      await import("../night/art/sprites");
    for (const dy of [1, 2, 3, 4, 5])
      for (const reduced of [false, true]) {
        const contact = 200 + contactOffset(dy);
        expect(ghostPosition(200, 0, dy, reduced)).toBe(contact);
        for (const gap of [0.01, 0.4, 1, 7.9, 8, 32, 120])
          expect(ghostPosition(200, gap, dy, reduced)).toBeLessThan(contact);
      }
  });
});

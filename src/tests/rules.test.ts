import { describe, it, expect } from "vitest";
import { makeRun, streak } from "../game/daily";
import { reducer } from "../game/reducer";
import type { Event } from "../game/reducer";
import type { Run } from "../game/types";
import { hash, mulberry32 } from "../game/rng";
import { points } from "../game/scoring";
import { letters, letterById } from "../content/letters";
import { validateContent } from "../content/validate";
import { finishRecords } from "../game/achievements";
import {
  freshRecords,
  load,
  save,
  normalizeRun,
  validRun,
} from "../game/persistence";
const step = (r: Run, e: Event) => reducer(r, e)!;
function answer(run: Run, correct = true, sealed = false) {
  let r = step(run, { type: "OPENING_COMPLETE" });
  r = step(r, {
    type: "SELECT_CLAIM",
    id: correct
      ? letterById[r.letters[r.round].puzzleId].falseClaimId
      : letterById[r.letters[r.round].puzzleId].claims.find(
          (c) => c.id !== letterById[r.letters[r.round].puzzleId].falseClaimId,
        )!.id,
  });
  if (sealed) r = step(r, { type: "TOGGLE_SEAL" });
  return step(r, { type: "SUBMIT" });
}
import { complete } from "./fixtures";

describe("scoring and seals", () => {
  it.each([
    [true, false, false, 100],
    [true, true, false, 200],
    [false, false, false, 0],
    [false, true, false, 0],
    [true, true, true, 0],
  ])("scores %s/%s/%s", (c, s, t, score) =>
    expect(points(c, s, t)).toBe(score),
  );
  it("caps a perfect six-letter shift at 800", () => {
    expect(complete().score).toBe(800);
    expect(complete().seals).toBe(0);
  });
  it("arming and disarming do not consume", () => {
    let r = step(makeRun("daily"), { type: "OPENING_COMPLETE" });
    r = step(r, { type: "TOGGLE_SEAL" });
    expect(r.armed).toBe(true);
    expect(r.seals).toBe(2);
    r = step(r, { type: "TOGGLE_SEAL" });
    expect(r.armed).toBe(false);
    expect(r.seals).toBe(2);
  });
  it("wrong sealed submission consumes once", () => {
    const r = answer(makeRun("practice"), false, true);
    expect(r.seals).toBe(1);
    expect(r.score).toBe(0);
    expect(step(r, { type: "SUBMIT" })).toBe(r);
  });
  it("timeout discards selection and does not consume armed seal", () => {
    let r = step(makeRun("practice"), { type: "OPENING_COMPLETE" });
    r = step(r, { type: "TOGGLE_SEAL" });
    r = step(r, { type: "SELECT_CLAIM", id: r.letters[0].claimIds[0] });
    r = step(r, { type: "TICK", elapsed: 25000 });
    r = step(r, { type: "TIMEOUT" });
    expect(r.answers[0]).toMatchObject({
      choice: null,
      sealed: false,
      points: 0,
      timeout: true,
    });
    expect(r.seals).toBe(2);
    expect(r.armed).toBe(false);
  });
  it("cannot over-arm or go negative", () => {
    let r = complete();
    r = { ...r, phase: "answering", armed: false };
    expect(step(r, { type: "TOGGLE_SEAL" }).armed).toBe(false);
    expect(r.seals).toBe(0);
  });
});
describe("reducer transitions", () => {
  it("ignores submit without selection and prevents skipping", () => {
    const r = step(makeRun("daily"), { type: "OPENING_COMPLETE" });
    expect(step(r, { type: "SUBMIT" })).toBe(r);
    expect(step(r, { type: "NEXT" })).toBe(r);
  });
  it("submit/timeout race resolves only once", () => {
    const r = answer(makeRun("daily"));
    expect(step(r, { type: "TIMEOUT" })).toBe(r);
    let timed = step(makeRun("daily"), { type: "OPENING_COMPLETE" });
    timed = step(timed, { type: "TICK", elapsed: 25000 });
    timed = step(timed, { type: "TIMEOUT" });
    expect(step(timed, { type: "SUBMIT" })).toBe(timed);
    expect(timed.answers).toHaveLength(1);
  });
  it("locks selection, handles completion once", () => {
    const r = answer(makeRun("daily"));
    expect(
      step(r, { type: "SELECT_CLAIM", id: r.letters[0].claimIds[1] }),
    ).toBe(r);
    expect(step(r, { type: "TOGGLE_SEAL" })).toBe(r);
    const done = complete();
    expect(done.phase).toBe("results");
    expect(done.answers).toHaveLength(6);
    expect(step(done, { type: "NEXT" })).toBe(done);
  });
  it("reduced-motion completion events cannot award twice", () => {
    const r = answer(makeRun("daily"));
    const reveal = step(r, { type: "STAMP_COMPLETE" });
    expect(step(reveal, { type: "STAMP_COMPLETE" })).toBe(reveal);
    expect(reveal.score).toBe(100);
  });
  it("only active timed answering advances the clock", () => {
    let r = step(makeRun("relaxed"), { type: "OPENING_COMPLETE" });
    expect(step(r, { type: "TICK", elapsed: 50000 }).remaining).toBe(25000);
    r = step(makeRun("daily"), { type: "OPENING_COMPLETE" });
    r = step(r, { type: "PAUSE" });
    expect(step(r, { type: "TICK", elapsed: 1000 }).remaining).toBe(25000);
    r = step(r, { type: "RESUME" });
    expect(step(r, { type: "TICK", elapsed: 500 }).remaining).toBe(24500);
  });
});
describe("selection pipeline", () => {
  it("has documented hash and PRNG vectors", () => {
    expect(hash("hello")).toBe(1335831723);
    expect(mulberry32(1)()).toBeCloseTo(0.6270739405881613, 12);
  });
  it("same date gives exact set/order/claim order", () => {
    expect(makeRun("daily", "2026-11-11")).toEqual(
      makeRun("daily", "2026-11-11"),
    );
    expect(makeRun("daily", "2026-11-11").letters).not.toEqual(
      makeRun("daily", "2026-11-12").letters,
    );
  });
  it("preserves the bank, IDs, truth, and all six categories", () => {
    const original = JSON.stringify(letters),
      r = makeRun("daily");
    expect(new Set(r.letters.map((l) => l.puzzleId)).size).toBe(6);
    expect(
      new Set(r.letters.map((l) => letterById[l.puzzleId].category)).size,
    ).toBe(6);
    r.letters.forEach((l) =>
      expect(l.claimIds).toContain(letterById[l.puzzleId].falseClaimId),
    );
    expect(JSON.stringify(letters)).toBe(original);
  });
  it("avoids immediate practice repetitions", () => {
    const first = makeRun("practice");
    const recent = Object.fromEntries(
      first.letters.map((l) => [letterById[l.puzzleId].category, l.puzzleId]),
    );
    const next = makeRun("practice", undefined, undefined, recent);
    next.letters.forEach((l) =>
      expect(l.puzzleId).not.toBe(recent[letterById[l.puzzleId].category]),
    );
  });
  it("validates all 36 content records", () =>
    expect(validateContent()).toEqual([]));
});
describe("persistence and achievements", () => {
  it("round-trips and normalizes committed animation", () => {
    const records = freshRecords();
    records.daily["2026-11-11"] = answer(makeRun("daily", "2026-11-11"));
    save(records);
    const restored = load();
    expect(restored.message).toBe("");
    expect(restored.records.daily["2026-11-11"].phase).toBe("reveal");
    expect(restored.records.daily["2026-11-11"].score).toBe(100);
    expect(restored.records.daily["2026-11-11"].paused).toBe(true);
  });
  it("normalizes next transition without replay or double increment", () => {
    let r = answer(makeRun("daily"));
    r = step(r, { type: "STAMP_COMPLETE" });
    r = step(r, { type: "NEXT" });
    expect(validRun(r)).toBe(true);
    const restored = normalizeRun(r);
    expect(restored.round).toBe(1);
    expect(restored.phase).toBe("opening");
    expect(normalizeRun(restored).round).toBe(1);
  });
  it("rejects corrupt/unsupported data and handles unavailable storage", () => {
    expect(load({ getItem: () => "{" }).message).toContain(
      "could not be restored",
    );
    expect(load({ getItem: () => '{"version":42}' }).message).toContain(
      "could not be restored",
    );
    expect(
      save(freshRecords(), {
        setItem: () => {
          throw Error("denied");
        },
      }),
    ).toBe(false);
    expect(
      load({
        getItem: () => {
          throw Error("denied");
        },
      }).message,
    ).toContain("can’t be saved");
  });
  it("retains unrelated records when one run is corrupt", () => {
    const records = freshRecords();
    records.collection = ["first-class"];
    records.daily["2026-11-11"] = { ...complete(), score: 999 };
    save(records);
    expect(load().records.collection).toEqual(["first-class"]);
    expect(load().records.daily).toEqual({});
  });
  it("unlocks exact rules with no duplicates", () => {
    let records = finishRecords(freshRecords(), complete("relaxed"));
    expect(records.collection.sort()).toEqual(
      ["first-class", "night-scholar", "sealed", "quiet", "worldly"].sort(),
    );
    expect(records.completedDates).toHaveLength(0);
    records = finishRecords(records, complete("daily", "2026-11-09"));
    records = finishRecords(records, complete("daily", "2026-11-10"));
    expect(records.collection).not.toContain("regular");
    records = finishRecords(records, complete("daily", "2026-11-11"));
    expect(records.collection).toContain("regular");
    expect(
      finishRecords(records, complete("daily", "2026-11-11")).collection,
    ).toEqual(records.collection);
  });
  it("does not grant perfection or sealed achievements for misses", () => {
    expect(
      finishRecords(freshRecords(), complete("practice", undefined, false))
        .collection,
    ).toEqual(["first-class", "worldly"]);
  });
  it("keeps the original Daily date across midnight and computes UTC streak", () => {
    const r = complete("daily", "2026-11-10");
    expect(finishRecords(freshRecords(), r).completedDates).toEqual([
      "2026-11-10",
    ]);
    expect(streak(["2026-11-09", "2026-11-10"], "2026-11-11")).toBe(2);
    expect(streak(["2026-11-08", "2026-11-10"], "2026-11-11")).toBe(1);
  });
});

describe("recovery boundaries", () => {
  it("an expired submit resolves as unanswered, even with a selection and seal", () => {
    let r = step(makeRun("daily"), { type: "OPENING_COMPLETE" });
    r = step(r, {
      type: "SELECT_CLAIM",
      id: letterById[r.letters[0].puzzleId].falseClaimId,
    });
    r = step(r, { type: "TOGGLE_SEAL" });
    r = step(r, { type: "TICK", elapsed: 25001 });
    r = step(r, { type: "SUBMIT" });
    expect(r.answers[0]).toMatchObject({
      timeout: true,
      choice: null,
      sealed: false,
      points: 0,
    });
    expect(r.seals).toBe(2);
  });
  it("malformed nested runs cannot throw or erase other records", () => {
    const records = {
      ...freshRecords(),
      daily: {
        "2026-11-11": { ...makeRun("daily", "2026-11-11"), letters: [null] },
      },
      collection: ["first-class"],
    };
    const restored = load({ getItem: () => JSON.stringify(records) });
    expect(restored.records.collection).toEqual(["first-class"]);
    expect(restored.message).toContain("could not be restored");
    expect(load({ getItem: () => "null" }).message).toContain(
      "could not be restored",
    );
  });
});

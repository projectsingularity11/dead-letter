import type { Run, Answer, Save } from "./types";
import { dailyMystery, mysteryById } from "../content/mysteries";
import { answerKey, matchesAnswer, validSubmission } from "./answers";
export const utcDate = (d = new Date()) => d.toISOString().slice(0, 10);
export const untilMidnight = (d = new Date()) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) -
  d.getTime();
export const duration = (r: Run) =>
  mysteryById[r.mysteryId].clues[r.clue].seconds * 1000;
export const clueCount = (r: Run) => mysteryById[r.mysteryId].clues.length;
export function makeRun(
  mode: Run["mode"] = "daily",
  date = utcDate(),
  mysteryId?: string,
  seed?: string,
): Run {
  const selected =
    mysteryId ?? (mode === "tutorial" ? "tutorial" : dailyMystery(date)?.id);
  if (!selected || !mysteryById[selected])
    throw new Error(
      "No case is scheduled for this date. Practice is still available.",
    );
  return {
    id:
      seed ??
      (mode === "daily" ? `night-walk-v4:${date}` : crypto.randomUUID()),
    date,
    mode,
    mysteryId: selected,
    phase: mode === "tutorial" ? "walking" : "intro",
    clue: 0,
    remaining: mysteryById[selected].clues[0].seconds * 1000,
    misses: [],
    answers: [],
    score: 0,
    paused: false,
  };
}
export type Event =
  | { type: "START" | "RESTORE"; run: Run }
  | { type: "RESET" }
  | { type: "BEGIN" | "ARRIVE" | "NEXT" | "PAUSE" | "RESUME" | "CATCH" }
  | { type: "TICK"; elapsed: number }
  | { type: "ANSWER"; values: string[] };
export function reducer(r: Run | null, e: Event): Run | null {
  if (e.type === "START" || e.type === "RESTORE") return e.run;
  if (e.type === "RESET") return null;
  if (!r) return null;
  if (e.type === "PAUSE") return { ...r, paused: true };
  if (e.type === "RESUME") return { ...r, paused: false };
  if (e.type === "BEGIN")
    return r.phase === "intro" && !r.paused ? { ...r, phase: "walking" } : r;
  if (e.type === "ARRIVE")
    return r.phase === "walking" && !r.paused
      ? { ...r, phase: "answering" }
      : r;
  if (e.type === "TICK") {
    if (
      r.phase !== "answering" ||
      r.paused ||
      !Number.isFinite(e.elapsed) ||
      e.elapsed <= 0 ||
      (r.mode === "tutorial" && r.clue === 0)
    )
      return r;
    const remaining = Math.max(0, r.remaining - e.elapsed);
    return { ...r, remaining, phase: remaining === 0 ? "caught" : "answering" };
  }
  if (e.type === "CATCH")
    return r.phase === "answering" && r.remaining <= 0
      ? { ...r, phase: "caught" }
      : r;
  if (e.type === "NEXT") {
    if (r.phase !== "banished" || r.paused) return r;
    if (r.clue === clueCount(r) - 1) return { ...r, phase: "escaped" };
    const next = {
      ...r,
      clue: r.clue + 1,
      phase: "walking" as const,
      misses: [],
    };
    return { ...next, remaining: duration(next) };
  }
  if (e.type === "ANSWER") {
    if (r.phase !== "answering" || r.paused) return r;
    if (r.remaining <= 0) return { ...r, phase: "caught" };
    const clue = mysteryById[r.mysteryId].clues[r.clue];
    if (
      !validSubmission(clue, e.values) ||
      r.misses.includes(answerKey(clue, e.values))
    )
      return r;
    const correct = matchesAnswer(clue, e.values),
      answer: Answer = {
        clueId: clue.id,
        values: e.values.map((v) => v.trim()),
        correct,
        remaining: r.remaining,
      };
    if (correct)
      return {
        ...r,
        phase: "banished",
        answers: [...r.answers, answer],
        score: r.mode === "tutorial" ? 0 : r.score + (r.clue + 1) * 100,
      };
    if (r.mode === "tutorial" && r.clue === 0)
      return {
        ...r,
        misses: [...r.misses, answerKey(clue, e.values)],
        answers: [...r.answers, answer],
      };
    const remaining = Math.max(0, r.remaining - Math.round(duration(r) * 0.35));
    return {
      ...r,
      remaining,
      misses: [...r.misses, answerKey(clue, e.values)],
      answers: [...r.answers, answer],
      phase: remaining === 0 ? "caught" : "answering",
    };
  }
  return r;
}
export const solved = (r: Run) => r.answers.filter((a) => a.correct).length;
export function commit(records: Save, run: Run | null): Save {
  if (!run) return records;
  if (run.mode === "tutorial")
    return {
      ...records,
      active: run,
      tutorialComplete: records.tutorialComplete || run.phase === "escaped",
    };
  return {
    ...records,
    active: run,
    ...(run.mode === "daily"
      ? { daily: { ...records.daily, [run.date]: run } }
      : { practice: run }),
    best: Math.max(records.best, run.score),
  };
}
export function resultText(r: Run) {
  return `DEAD LETTER — ${r.mode === "daily" ? r.date : r.mode === "tutorial" ? "Tutorial" : "Practice"}\n${r.phase === "escaped" ? "Escaped" : "Caught"} | ${solved(r)}/${clueCount(r)} clues | ${r.score} points\n${"■".repeat(solved(r))}${"□".repeat(clueCount(r) - solved(r))}\nGet Pete home.`;
}

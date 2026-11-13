import type { Run, Answer, Save } from "./types";
import { mysteries, mysteryById } from "../content/mysteries";
import { hash, mulberry32, shuffle } from "../../game/rng";
export const utcDate = (d = new Date()) => d.toISOString().slice(0, 10);
export const duration = (r: Run) =>
  mysteryById[r.mysteryId].clues[r.clue].seconds * 1000;
export function makeRun(
  mode: Run["mode"] = "daily",
  date = utcDate(),
  mysteryId?: string,
  seed?: string,
): Run {
  const ordinal = Math.floor(
    new Date(`${date}T00:00:00Z`).getTime() / 86400000,
  );
  const selected =
    mysteryId ??
    mysteries[
      (((ordinal - Math.floor(Date.UTC(2026, 10, 11) / 86400000)) % 7) + 7) % 7
    ].id;
  const id =
    seed ?? (mode === "daily" ? `night-walk-v3:${date}` : crypto.randomUUID());
  const random = mulberry32(hash(id));
  const m = mysteryById[selected];
  return {
    id,
    date,
    mode,
    mysteryId: selected,
    phase: "walking",
    clue: 0,
    remaining: m.clues[0].seconds * 1000,
    misses: [],
    answers: [],
    score: 0,
    paused: false,
    choiceOrder: m.clues.map((c) =>
      shuffle(
        c.choices.map((o) => o.id),
        random,
      ),
    ),
  };
}
export type Event =
  | { type: "START" | "RESTORE"; run: Run }
  | { type: "RESET" }
  | { type: "ARRIVE" | "NEXT" | "PAUSE" | "RESUME" | "CATCH" }
  | { type: "TICK"; elapsed: number }
  | { type: "ANSWER"; choiceId: string };
export function reducer(r: Run | null, e: Event): Run | null {
  if (e.type === "START" || e.type === "RESTORE") return e.run;
  if (e.type === "RESET") return null;
  if (!r) return null;
  if (e.type === "PAUSE") return { ...r, paused: true };
  if (e.type === "RESUME") return { ...r, paused: false };
  if (e.type === "ARRIVE")
    return r.phase === "walking" && !r.paused
      ? { ...r, phase: "answering" }
      : r;
  if (e.type === "TICK") {
    if (
      r.phase !== "answering" ||
      r.paused ||
      !Number.isFinite(e.elapsed) ||
      e.elapsed <= 0
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
    if (r.clue === 7) return { ...r, phase: "escaped" };
    const next = {
      ...r,
      clue: r.clue + 1,
      phase: "walking" as const,
      misses: [],
    };
    return { ...next, remaining: duration(next) };
  }
  if (e.type === "ANSWER") {
    if (r.phase !== "answering" || r.paused || r.misses.includes(e.choiceId))
      return r;
    if (r.remaining <= 0) return { ...r, phase: "caught" };
    const clue = mysteryById[r.mysteryId].clues[r.clue];
    if (!clue.choices.some((c) => c.id === e.choiceId)) return r;
    const correct = e.choiceId === clue.answerId;
    const answer: Answer = {
      clueId: clue.id,
      choiceId: e.choiceId,
      correct,
      remaining: r.remaining,
    };
    if (correct)
      return {
        ...r,
        phase: "banished",
        answers: [...r.answers, answer],
        score: r.score + (r.clue + 1) * 100,
      };
    const remaining = Math.max(0, r.remaining - Math.round(duration(r) * 0.35));
    return {
      ...r,
      remaining,
      misses: [...r.misses, e.choiceId],
      answers: [...r.answers, answer],
      phase: remaining === 0 ? "caught" : "answering",
    };
  }
  return r;
}
export function solved(r: Run) {
  return r.answers.filter((a) => a.correct).length;
}
export function commit(records: Save, run: Run | null): Save {
  if (!run) return records;
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
  return `DEAD LETTER — ${r.mode === "daily" ? r.date : "Practice"}\n${r.phase === "escaped" ? "Escaped" : "Caught"} | ${solved(r)}/8 clues | ${r.score} points\n${r.answers
    .filter((a) => a.correct)
    .map(() => "■")
    .join("")}${"□".repeat(8 - solved(r))}\nGet Pete home.`;
}

import { categories } from "./types";
import type { Mode, Run, Records } from "./types";
import { letters } from "../content/letters";
import { hash, mulberry32, shuffle } from "./rng";
export const CONTENT_VERSION = "dead-letter-v1";
export const utcDate = (now = new Date()) => now.toISOString().slice(0, 10);
export function makeRun(
  mode: Mode,
  date = utcDate(),
  seed = mode === "daily" ? `${CONTENT_VERSION}:${date}` : crypto.randomUUID(),
  recent: Records["recent"] = {},
): Run {
  const random = mulberry32(hash(seed));
  const chosen = categories.map((category) => {
    const pool = letters.filter(
      (p) =>
        p.category === category &&
        (mode === "daily" || p.id !== recent[category]),
    );
    return pool[Math.floor(random() * pool.length)];
  });
  const played = shuffle(chosen, random).map((p) => ({
    puzzleId: p.id,
    claimIds: shuffle(
      p.claims.map((c) => c.id),
      random,
    ),
  }));
  return {
    id: seed,
    date,
    mode,
    letters: played,
    phase: "opening",
    round: 0,
    answers: [],
    remaining: 25000,
    score: 0,
    seals: 2,
    armed: false,
    selected: null,
    paused: false,
  };
}
export function streak(dates: string[], today = utcDate()) {
  const unique = new Set(dates);
  let day = new Date(`${today}T00:00:00Z`);
  if (!unique.has(today)) day.setUTCDate(day.getUTCDate() - 1);
  let count = 0;
  while (unique.has(utcDate(day))) {
    count++;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return count;
}

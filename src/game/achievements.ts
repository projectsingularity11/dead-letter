import type { Records, Run } from "./types";
import { letterById } from "../content/letters";
export const awards = [
  ["first-class", "First Class", "Complete any shift."],
  [
    "night-scholar",
    "Night Scholar",
    "Deliver all six letters correctly in one shift.",
  ],
  [
    "sealed",
    "Sealed With Certainty",
    "Submit at least one correct sealed answer.",
  ],
  ["regular", "Regular Correspondent", "Complete three distinct Daily dates."],
  ["quiet", "Quiet Hours", "Complete one Relaxed Practice shift."],
  [
    "worldly",
    "Worldly Spirit",
    "Complete a shift containing all six categories.",
  ],
] as const;
export function finishRecords(records: Records, run: Run): Records {
  if (run.phase !== "results" || run.answers.length !== 6) return records;
  const dates = [
    ...new Set([
      ...records.completedDates,
      ...(run.mode === "daily" ? [run.date] : []),
    ]),
  ];
  const earned = [
    "first-class",
    ...(run.answers.every((a) => a.correct) ? ["night-scholar"] : []),
    ...(run.answers.some((a) => a.correct && a.sealed) ? ["sealed"] : []),
    ...(dates.length >= 3 ? ["regular"] : []),
    ...(run.mode === "relaxed" ? ["quiet"] : []),
    ...(new Set(run.letters.map((l) => letterById[l.puzzleId].category))
      .size === 6
      ? ["worldly"]
      : []),
  ];
  return {
    ...records,
    completedDates: dates,
    collection: [...new Set([...records.collection, ...earned])],
  };
}

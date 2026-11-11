import type { Run } from "./types";
export const correctCount = (run: Run) =>
  run.answers.filter((a) => a.correct).length;
export function receiptText(run: Run) {
  return `DEAD LETTER — ${run.mode === "daily" ? run.date : "Practice"}\nDelivered ${correctCount(run)}/6 | ${run.score}/800\n${run.answers.map((a) => (a.correct ? "[O]" : "[X]")).join("")}\nTwo worlds. One questionable postal service.`;
}
export function headline(n: number) {
  return n === 6
    ? "Every spirit got the truth."
    : n >= 4
      ? "A fine night’s correspondence."
      : n >= 2
        ? "Some letters took the scenic route."
        : "The dead are a patient audience.";
}

import { mysteries, schedule, tutorial, practiceMysteries } from "./mysteries";
import { matchesAnswer, validSubmission } from "../game/answers";
export function validateMysteries() {
  const errors: string[] = [],
    ids = new Set<string>(),
    signatures = new Set<string>();
  if (mysteries.length !== 100) errors.push("100 scheduled cases required");
  mysteries.forEach((m, mi) => {
    if (m.clues.length !== 8) errors.push(`${m.id}: eight pages required`);
    if (
      mi &&
      Date.parse(m.date) - Date.parse(schedule[mi - 1].date) !== 86400000
    )
      errors.push(`${m.id}: missing calendar day`);
    const signature = m.clues.map((c) => c.evidence).join("|");
    if (signatures.has(signature)) errors.push(`${m.id}: repeated case`);
    signatures.add(signature);
  });
  for (const m of [...mysteries, ...practiceMysteries, tutorial])
    for (const [i, c] of m.clues.entries()) {
      if (ids.has(c.id)) errors.push(`${c.id}: duplicate`);
      ids.add(c.id);
      if (
        !c.evidence ||
        !c.question ||
        !c.explanation ||
        !c.fields.length ||
        c.seconds < 60
      )
        errors.push(`${c.id}: incomplete`);
      if (
        !validSubmission(
          c,
          c.fields.map((f) => f.answer),
        )
      )
        errors.push(`${c.id}: answer format invalid`);
      if (c.solutions.length !== 1 || !matchesAnswer(c, c.solutions[0] ?? []))
        errors.push(`${c.id}: ambiguous or incorrect`);
      if (
        m.id !== "tutorial" &&
        c.difficulty !==
          (i < 2 ? "easy" : i < 5 ? "medium" : i < 7 ? "hard" : "final")
      )
        errors.push(`${c.id}: difficulty order`);
    }
  return errors;
}
if (process.argv[1]?.endsWith("validate.ts")) {
  const errors = validateMysteries();
  if (errors.length) {
    console.error(errors);
    process.exitCode = 1;
  } else
    console.log(
      "100 consecutive daily cases / 800 evidence puzzles + 2 tutorial pages validated.",
    );
}

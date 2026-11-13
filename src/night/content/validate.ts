import { mysteries, solutionAudits } from "./mysteries";
export function validateMysteries() {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const m of mysteries) {
    if (seen.has(m.id)) errors.push("Duplicate mystery");
    seen.add(m.id);
    if (m.clues.length !== 8) errors.push(`${m.id}: eight clues required`);
    const ids = new Set<string>();
    for (const [i, c] of m.clues.entries()) {
      if (ids.has(c.id)) errors.push(`${c.id}: duplicate`);
      ids.add(c.id);
      if (
        c.choices.length !== 4 ||
        new Set(c.choices.map((o) => o.id)).size !== 4
      )
        errors.push(`${c.id}: choices`);
      if (c.choices.filter((o) => o.id === c.answerId).length !== 1)
        errors.push(`${c.id}: answer`);
      if (!c.evidence || !c.question || !c.explanation || c.seconds < 20)
        errors.push(`${c.id}: incomplete`);
      if (
        c.difficulty !==
        (i < 2 ? "easy" : i < 5 ? "medium" : i < 7 ? "hard" : "final")
      )
        errors.push(`${c.id}: difficulty order`);
    }
  }
  for (const audit of solutionAudits) {
    if (audit.candidates.length !== 1 || audit.candidates[0] !== audit.answer)
      errors.push(`${audit.id}: solution is ambiguous or incorrect`);
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
      `${mysteries.length} mysteries / ${mysteries.length * 8} connected clues validated.`,
    );
}

import { letters } from "./letters";
import { categories } from "../game/types";
export function validateContent() {
  const errors: string[] = [];
  const check = (ok: boolean, msg: string) => {
    if (!ok) errors.push(msg);
  };
  check(letters.length === 36, "Expected 36 puzzles");
  check(new Set(letters.map((p) => p.id)).size === 36, "Unique puzzle IDs");
  const ids = new Set<string>();
  for (const p of letters) {
    check(p.claims.length === 4, `${p.id}: four claims`);
    for (const c of p.claims) {
      check(!ids.has(c.id), `${c.id}: duplicate`);
      ids.add(c.id);
      check(c.text.length > 0 && c.text.length <= 140, `${c.id}: length`);
    }
    check(
      p.claims.filter((c) => c.id === p.falseClaimId).length === 1,
      `${p.id}: false ID`,
    );
    check(!!p.correction && p.correction.length <= 220, `${p.id}: correction`);
    check(!!p.explanation, `${p.id}: explanation`);
    check(
      p.reactionCorrect.length <= 90 && p.reactionIncorrect.length <= 90,
      `${p.id}: reactions`,
    );
    check(
      p.sources.length > 0 &&
        p.sources.every(
          (s) => !!s.title && new URL(s.url).protocol === "https:",
        ),
      `${p.id}: sources`,
    );
    check(
      p.claims.every((c) =>
        p.sources.some((s) => s.supportedClaimIds.includes(c.id)),
      ),
      `${p.id}: source coverage`,
    );
  }
  for (const c of categories) {
    const group = letters.filter((p) => p.category === c);
    check(group.length === 6, `${c}: six puzzles`);
    check(
      group.filter((p) => p.difficulty === "easy").length === 2 &&
        group.filter((p) => p.difficulty === "medium").length === 3 &&
        group.filter((p) => p.difficulty === "hard").length === 1,
      `${c}: difficulty distribution`,
    );
  }
  return errors;
}
if (process.argv[1]?.endsWith("validate.ts")) {
  const errors = validateContent();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      "36 puzzles validated. Editorial verification remains outstanding for all 36.",
    );
}

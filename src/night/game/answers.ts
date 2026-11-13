import type { AnswerField, Clue } from "./types";
export function normalize(value: string, kind: AnswerField["kind"]) {
  const text = value.normalize("NFKC").trim().toUpperCase();
  if (kind === "time") {
    const digits = text.replace(/\s/g, "").match(/^(\d{1,2}):?(\d{2})$/);
    return digits ? `${digits[1].padStart(2, "0")}${digits[2]}` : text;
  }
  if (kind === "code") return text.replace(/[\s\-→>]/g, "");
  if (kind === "number")
    return /^\d+$/.test(text) ? String(Number(text)) : text;
  if (kind === "set")
    return text === "NONE"
      ? "NONE"
      : [...text.replace(/[\s+,\-]/g, "")].sort().join("");
  return text.replace(/[\s\-’']/g, "");
}
export function formatError(value: string, field: AnswerField) {
  const text = value.trim();
  if (!text) return "Complete this field before submitting.";
  if (text.length > 80) return "Use 80 characters or fewer.";
  if (
    field.kind === "time" &&
    !/^(?:[01]?\d|2[0-3]):?[0-5]\d$/.test(text.replace(/\s/g, ""))
  )
    return "Use a 24-hour time, such as 03:05.";
  if (field.kind === "number" && !/^\d+$/.test(text))
    return "Enter digits only.";
  if (
    field.kind === "set" &&
    text.toUpperCase() !== "NONE" &&
    !/^[A-E](?:[\s+,\-]*[A-E])*$/i.test(text)
  )
    return "Use switch letters A–E, separated by +, or NONE.";
  return "";
}
export function answerKey(clue: Clue, values: string[]) {
  return values.map((v, i) => normalize(v, clue.fields[i].kind)).join("|");
}
export function validSubmission(clue: Clue, values: string[]) {
  return (
    values.length === clue.fields.length &&
    values.every(
      (v, i) => typeof v === "string" && !formatError(v, clue.fields[i]),
    )
  );
}
export function matchesAnswer(clue: Clue, values: string[]) {
  return (
    validSubmission(clue, values) &&
    values.every(
      (v, i) =>
        normalize(v, clue.fields[i].kind) ===
        normalize(clue.fields[i].answer, clue.fields[i].kind),
    )
  );
}

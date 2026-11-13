import { useState } from "react";
import type { Clue } from "../game/types";
import { answerKey, formatError } from "../game/answers";
import { PixelIcon } from "./PixelIcon";
export function AnswerForm({
  clue,
  disabled,
  misses,
  safe = false,
  onAnswer,
}: {
  clue: Clue;
  disabled: boolean;
  misses: string[];
  safe?: boolean;
  onAnswer: (values: string[]) => void;
}) {
  const [values, setValues] = useState(() => clue.fields.map(() => "")),
    [errors, setErrors] = useState<string[]>([]),
    [duplicate, setDuplicate] = useState(false);
  return (
    <form
      className="deduction-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        const problems = clue.fields.map((f, i) => formatError(values[i], f));
        setErrors(problems);
        if (problems.some(Boolean)) {
          document
            .getElementById(`${clue.id}-${problems.findIndex(Boolean)}`)
            ?.focus();
          return;
        }
        if (misses.includes(answerKey(clue, values))) {
          setDuplicate(true);
          return;
        }
        setDuplicate(false);
        onAnswer(values);
      }}
    >
      <div
        className={`deduction-fields ${clue.fields.length > 2 ? "many-fields" : ""}`}
      >
        {clue.fields.map((f, i) => {
          const id = `${clue.id}-${i}`;
          return (
            <div className="deduction-field" key={id}>
              <label htmlFor={id}>{f.label}</label>
              <input
                id={id}
                name={`deduction-${i}`}
                className="answer-input"
                value={values[i]}
                onChange={(e) => {
                  setValues((v) =>
                    v.map((old, j) => (j === i ? e.target.value : old)),
                  );
                  setDuplicate(false);
                  setErrors([]);
                }}
                disabled={disabled}
                maxLength={80}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode={
                  f.kind === "number"
                    ? "numeric"
                    : f.kind === "time"
                      ? "text"
                      : "text"
                }
                aria-invalid={!!errors[i]}
                aria-describedby={`${id}-hint${errors[i] ? ` ${id}-error` : ""}`}
              />
              <span className="field-hint" id={`${id}-hint`}>
                {f.hint}
              </span>
              {errors[i] && (
                <span className="field-error" id={`${id}-error`}>
                  {errors[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="deduction-submit">
        <button
          className="pixel-button submit-answer"
          disabled={disabled}
          type="submit"
        >
          SUBMIT DEDUCTION <PixelIcon name="arrow" />
        </button>
        <span>ENTER TO SUBMIT</span>
      </div>
      <p
        className={`deduction-feedback ${misses.length || duplicate ? "wrong-feedback" : ""}`}
        role="status"
      >
        {duplicate
          ? "Already tried. Recheck the evidence; no extra penalty."
          : safe
            ? misses.length
              ? "That doesn’t match the note. Read it again; there’s no penalty on this lesson."
              : "A safe first step. Read both facts from the note; there’s no timer or mistake penalty."
            : misses.length
              ? `That deduction doesn’t fit. The ghost gained ground. ${3 - misses.length} attempts remain.`
              : "Every field must fit. Wrong deductions cost 35% of the page’s time."}
      </p>
    </form>
  );
}

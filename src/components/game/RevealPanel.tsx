import type { Answer, LetterPuzzle } from "../../game/types";
export function Sources({ puzzle }: { puzzle: LetterPuzzle }) {
  return (
    <div className="sources">
      <span>Further reading · editorial review pending</span>
      {puzzle.sources.map((s) => (
        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
          {s.title} ↗
        </a>
      ))}
    </div>
  );
}
export function RevealPanel({
  puzzle,
  answer,
}: {
  puzzle: LetterPuzzle;
  answer: Answer;
}) {
  return (
    <section
      className={`reveal-panel ${answer.correct ? "correct" : "incorrect"}`}
    >
      <div className="reveal-heading" role="status">
        <h2 tabIndex={-1}>
          {answer.timeout
            ? "The collection bell rang"
            : answer.correct
              ? "Lie intercepted"
              : "That one slipped through"}
        </h2>
        <strong>+{answer.points}</strong>
      </div>
      <p className="correction">{puzzle.correction}</p>
      <p>{puzzle.explanation}</p>
      <Sources puzzle={puzzle} />
      <blockquote>
        “{answer.correct ? puzzle.reactionCorrect : puzzle.reactionIncorrect}”
      </blockquote>
      {answer.timeout && (
        <p>No answer submitted. Your wax seal was not used.</p>
      )}
    </section>
  );
}

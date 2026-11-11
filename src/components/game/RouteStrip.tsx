import type { Run } from "../../game/types";
export function RouteStrip({ run }: { run: Run }) {
  return (
    <ol className="route-strip" aria-label="Shift progress">
      {run.letters.map((l, i) => (
        <li
          key={l.puzzleId}
          className={i === run.round ? "current" : ""}
          aria-label={`Letter ${i + 1}: ${run.answers[i] ? (run.answers[i].correct ? "delivered" : "missed") : i === run.round ? "current" : "waiting"}`}
        >
          <span aria-hidden="true">
            {run.answers[i]
              ? run.answers[i].correct
                ? "✓"
                : "×"
              : String(i + 1).padStart(2, "0")}
          </span>
        </li>
      ))}
    </ol>
  );
}

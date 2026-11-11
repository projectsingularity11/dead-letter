import { useState, useEffect } from "react";
import type { Run } from "../game/types";
import {
  PostalCrest,
  GhostPortrait,
  CollectibleStamp,
  UtilityIcon,
} from "../art/PostalArt";
import { correctCount, headline, receiptText } from "../game/selectors";
import { utcDate } from "../game/daily";
import { awards } from "../game/achievements";
export function ResultsScreen({
  run,
  unlocks,
  onReview,
  onPractice,
  onHome,
  onDaily,
  notify,
}: {
  run: Run;
  unlocks: string[];
  onReview: () => void;
  onPractice: () => void;
  onHome: () => void;
  onDaily: () => void;
  notify: (s: string) => void;
}) {
  const [fallback, setFallback] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const until = 86400000 - (now % 86400000);
  const countdown = [
    Math.floor(until / 3600000),
    Math.floor(until / 60000) % 60,
    Math.floor(until / 1000) % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  async function copy() {
    try {
      await navigator.clipboard.writeText(receiptText(run));
      setFallback(false);
      notify("Copied to clipboard");
    } catch {
      setFallback(true);
      notify("Copy wasn’t available. Select the receipt below.");
    }
  }
  return (
    <main className="results-screen">
      <article className="result-receipt">
        <div className="receipt-brand">
          <PostalCrest />
          <span>DEAD LETTER</span>
          <small>SHIFT RECEIPT</small>
        </div>
        <p className="receipt-date">
          {run.mode === "daily"
            ? `${run.date} · UTC`
            : run.mode === "relaxed"
              ? "Relaxed Practice"
              : "Practice"}
        </p>
        <h1 tabIndex={-1}>{headline(correctCount(run))}</h1>
        <dl className="receipt-metrics">
          <div>
            <dt>Delivered</dt>
            <dd>
              {correctCount(run)} <small>/ 6</small>
            </dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>
              {run.score} <small>/ 800</small>
            </dd>
          </div>
          <div>
            <dt>Seals used</dt>
            <dd>
              {2 - run.seals} <small>/ 2</small>
            </dd>
          </div>
        </dl>
        <ol className="outcome-marks" aria-label="Letter outcomes">
          {run.answers.map((a, i) => (
            <li
              key={a.puzzleId}
              className={a.correct ? "delivered" : "missed"}
              aria-label={`Letter ${i + 1}: ${a.correct ? "delivered" : "missed"}`}
            >
              <span aria-hidden="true">{a.correct ? "✓" : "×"}</span>
            </li>
          ))}
        </ol>
        <div className="receipt-souvenir">
          <CollectibleStamp index={0} />
          <div>
            <strong>
              {unlocks.length
                ? "Fresh postage for your collection"
                : "A souvenir from the night post"}
            </strong>
            <p>
              {unlocks.length
                ? awards
                    .filter((a) => unlocks.includes(a[0]))
                    .map((a) => a[1])
                    .join(" · ")
                : "First Class · Thank you for your shift."}
            </p>
          </div>
        </div>
        <button className="button stamp-button" onClick={copy}>
          Copy shift receipt <UtilityIcon kind="arrow" />
        </button>
        {fallback && (
          <label className="share-fallback">
            Copy wasn’t available. Select the receipt below.
            <textarea
              readOnly
              value={receiptText(run)}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Shareable shift receipt"
            />
          </label>
        )}
        <div className="receipt-actions">
          <button className="text-button" onClick={onReview}>
            Review letters
          </button>
          <button className="text-button" onClick={onPractice}>
            Practice another shift
          </button>
          <button className="text-button" onClick={onHome}>
            Back to post office
          </button>
        </div>
        {run.mode === "daily" && (
          <p className="reset-note">
            Next Daily at 00:00 UTC
            <br />
            <strong>{countdown}</strong>
            {run.date !== utcDate() && (
              <button className="text-button" onClick={onDaily}>
                Begin the new Daily
              </button>
            )}
          </p>
        )}
        <p className="receipt-signoff">
          Two worlds. One questionable postal service.
        </p>
      </article>
      <GhostPortrait className="receipt-ghost" />
    </main>
  );
}

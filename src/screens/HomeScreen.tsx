import { Envelope, PostalCrest } from "../art/PostalArt";
import { streak, utcDate } from "../game/daily";
import type { Mode, Records, Run } from "../game/types";
export function HomeScreen({
  records,
  onStart,
  onTutorial,
  onAbout,
  onResume,
}: {
  records: Records;
  onStart: (mode: Mode) => void;
  onTutorial: () => void;
  onAbout: () => void;
  onResume: (run: Run) => void;
}) {
  const waiting = [
    ...Object.values(records.daily),
    ...(records.practice ? [records.practice] : []),
  ].find(
    (r) =>
      r.id === records.activeId &&
      r.phase !== "results" &&
      (r.mode !== "daily" || r.date !== utcDate()),
  );
  const daily = records.daily[utcDate()];
  return (
    <main className="home-screen">
      <div className="home-envelope">
        <Envelope />
        <span className="envelope-note">FOR THE NIGHT CLERK</span>
      </div>
      <div className="home-title">
        <span className="postal-eyebrow">
          <span />
          THE OTHER SIDE HAS A POSTCODE.
          <span />
        </span>
        <h1>
          DEAD LETTER
          <span className="title-star" aria-hidden="true">
            ✧
          </span>
        </h1>
        <p className="subtitle">The night post between worlds.</p>
      </div>
      <p className="hook">
        Somebody mailed a lie to the afterlife.
        <br />
        <em>Find it.</em>
      </p>
      <div className="home-actions">
        <button
          className="button home-primary"
          onClick={() => onStart("daily")}
        >
          {daily?.phase === "results"
            ? "View tonight’s receipt"
            : daily
              ? "Resume tonight’s shift"
              : "Begin tonight’s shift"}
          <span aria-hidden="true">→</span>
        </button>
        <div className="practice-actions">
          <button onClick={() => onStart("practice")}>Practice shift</button>
          <span aria-hidden="true">·</span>
          <button onClick={() => onStart("relaxed")}>Relaxed practice</button>
        </div>
      </div>
      {waiting && (
        <button
          className="text-button resume-link"
          onClick={() => onResume(waiting)}
        >
          Resume{" "}
          {waiting.mode === "daily"
            ? `${waiting.date} Daily`
            : waiting.mode === "relaxed"
              ? "Relaxed Practice"
              : "Practice"}{" "}
          shift
        </button>
      )}
      <p className="home-support">
        Six letters. One lie in each.
        <br className="compact-break" /> Two seals to trust your instincts.
      </p>
      <div className="home-status">
        <span>
          {utcDate()} <small>UTC</small>
        </span>
        <span>{streak(records.completedDates)} day streak</span>
        <span>Daily resets at 00:00 UTC.</span>
      </div>
      <nav className="home-links" aria-label="More about the game">
        <button onClick={onTutorial}>How to play</button>
        <PostalCrest />
        <button onClick={onAbout}>About the post office</button>
      </nav>
      <footer className="home-footer">BETWEEN WORLDS. BEFORE DAWN.</footer>
    </main>
  );
}

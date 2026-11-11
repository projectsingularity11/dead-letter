import { useState } from "react";
import * as Radio from "@radix-ui/react-radio-group";
import type { Modal, Records, Run, Preferences } from "../game/types";
import { PaperDialog } from "../components/ui/PaperDialog";
import { SettingSwitch } from "../components/ui/SettingSwitch";
import { CollectibleStamp, WaxSeal } from "../art/PostalArt";
import { awards } from "../game/achievements";
import { letterById } from "../content/letters";
import { recipients } from "../content/recipients";
import { Sources } from "../components/game/RevealPanel";
export function Overlays({
  modal,
  records,
  run,
  onClose,
  onPreferences,
  onReset,
  onResume,
  onTutorialDone,
  audioFailed,
}: {
  modal: Modal;
  records: Records;
  run: Run | null;
  onClose: () => void;
  onPreferences: (p: Preferences) => void;
  onReset: () => void;
  onResume: () => void;
  onTutorialDone: () => void;
  audioFailed: boolean;
}) {
  const [step, setStep] = useState(1),
    [training, setTraining] = useState("");
  if (modal === "settings")
    return (
      <PaperDialog
        title="Post office settings"
        description="Make yourself comfortable for the night shift."
        onClose={onClose}
      >
        <SettingSwitch
          label="Sound effects"
          checked={records.preferences.sound}
          onChange={(v) => onPreferences({ ...records.preferences, sound: v })}
        />
        <SettingSwitch
          label="Atmosphere"
          checked={records.preferences.atmosphere}
          onChange={(v) =>
            onPreferences({ ...records.preferences, atmosphere: v })
          }
        />
        {audioFailed && (
          <p>
            Sound is unavailable in this browser. You can keep playing quietly.
          </p>
        )}
        <fieldset className="motion-settings">
          <legend>Motion</legend>
          <Radio.Root
            value={records.preferences.motion}
            onValueChange={(v) =>
              onPreferences({
                ...records.preferences,
                motion: v as Preferences["motion"],
              })
            }
            aria-label="Motion preference"
          >
            {["system", "reduced", "full"].map((v) => (
              <label key={v}>
                <Radio.Item value={v} className="setting-radio">
                  <Radio.Indicator />
                </Radio.Item>
                {v[0].toUpperCase() + v.slice(1)}
              </label>
            ))}
          </Radio.Root>
        </fieldset>
        <p>Scores and progress stay in this browser.</p>
        <div className="danger-zone">
          <button className="text-button" onClick={onReset}>
            Reset local records
          </button>
        </div>
      </PaperDialog>
    );
  if (modal === "collection")
    return (
      <PaperDialog
        title="Postage from the other side"
        description="Small souvenirs from your shifts at the night post."
        onClose={onClose}
        wide
      >
        <div className="collection-grid">
          {awards.map(([id, title, condition], i) => (
            <div
              className={`stamp-cell ${records.collection.includes(id) ? "unlocked" : "locked"}`}
              key={id}
            >
              <CollectibleStamp index={i} />
              <h3>{title}</h3>
              <p>{condition}</p>
              <span>
                {records.collection.includes(id)
                  ? "Collected"
                  : "Not yet collected"}
              </span>
            </div>
          ))}
        </div>
      </PaperDialog>
    );
  if (modal === "about")
    return (
      <PaperDialog
        title="About the post office"
        description="A little truth. A long way home."
        onClose={onClose}
      >
        <h3>Six letters. One lie in each.</h3>
        <p>
          You are the night clerk at a post office between worlds. Select the
          one false statement in each letter and stamp RETURN TO SENDER.
        </p>
        <h3>The clerk’s ledger</h3>
        <p>
          Correct answers earn 100 points. A wax seal doubles a correct answer
          to 200. Two seals per shift; a wrong sealed answer still uses the
          seal. Wrong answers and timeouts earn 0. The maximum is 800. No speed
          bonus or penalty.
        </p>
        <p>
          Each timed letter allows 25 seconds of active answering. Relaxed
          Practice has no timer. Dialogs and hidden tabs pause the clock.
        </p>
        <h3>Daily correspondence</h3>
        <p>
          A new Daily begins at 00:00 UTC. Everyone using this content version
          gets the same letters for that UTC date. A shift keeps its original
          date across midnight.
        </p>
        <h3>At this small post office</h3>
        <p>
          There are 36 puzzles, six in each category. Practice avoids your
          previous puzzle in each category when possible. Repeats will occur.
        </p>
        <p>
          Records, preferences, stamps, and streaks stay in this browser. There
          are no accounts, servers, or online leaderboards. Local records are
          not protected against editing.
        </p>
        <h3>Editorial note</h3>
        <p>
          All 36 puzzles need editorial review. External source access was
          unavailable during implementation. Further-reading links are supplied,
          but all four statements in every puzzle still require independent
          source verification.
        </p>
        <h3>Made for the night</h3>
        <p>
          Original vector artwork and synthesized Web Audio. Set in Fraunces,
          Source Sans 3, and Special Elite. Built with React, Radix Primitives,
          and Motion. Reference and license details are included with the
          source.
        </p>
      </PaperDialog>
    );
  if (modal === "resume")
    return (
      <PaperDialog
        title="Your shift is waiting."
        description="Your letter and remaining time are right where you left them."
        onClose={onClose}
      >
        <button className="button stamp-button" onClick={onResume}>
          Resume shift
        </button>
        <p>The clock stays paused until you’re ready.</p>
      </PaperDialog>
    );
  if (modal === "tutorial")
    return (
      <PaperDialog
        title={
          step === 1 ? "Find the letter’s lie" : "Stamp it. Trust it. Send it."
        }
        description={
          step === 1
            ? "Each letter contains four statements. Three are true. One is false."
            : "A little confidence goes a long way."
        }
        onClose={onClose}
      >
        {step === 1 ? (
          <>
            <p className="small-label">
              FICTIONAL TRAINING EXAMPLE · NOT SCORED
            </p>
            <Radio.Root
              className="training-claims"
              aria-label="Training statement"
              value={training}
              onValueChange={setTraining}
            >
              {[
                "This post office opens at night.",
                "Ghosts collect the mail.",
                "The postmaster wears a cap.",
                "This is an ordinary daytime post office.",
              ].map((t, i) => (
                <Radio.Item className="claim" key={t} value={String(i)}>
                  <span className="claim-marker">{"ABCD"[i]}</span>
                  {t}
                  <Radio.Indicator className="training-indicator" />
                </Radio.Item>
              ))}
            </Radio.Root>
            <p role="status">
              {training
                ? training === "3"
                  ? "Exactly. That statement goes back to the sender."
                  : "Take another look at the night post office."
                : "Choose the fictional statement that doesn’t fit."}
            </p>
            <button className="button next-button" onClick={() => setStep(2)}>
              Next
            </button>
          </>
        ) : (
          <>
            <div className="tutorial-seals">
              <WaxSeal />
              <WaxSeal />
            </div>
            <p>Select a statement, then stamp RETURN TO SENDER.</p>
            <p>Two wax seals can double two correct answers.</p>
            <p>A wrong answer still lets you finish your shift.</p>
            <div className="dialog-actions">
              <button className="text-button" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="button stamp-button" onClick={onTutorialDone}>
                Start my shift
              </button>
            </div>
          </>
        )}
        <button className="text-button skip-tutorial" onClick={onTutorialDone}>
          Skip tutorial
        </button>
      </PaperDialog>
    );
  if (modal === "review" && run)
    return (
      <PaperDialog
        title="The night’s correspondence"
        description="Your letters, exactly as they passed across the desk."
        onClose={onClose}
        wide
      >
        <div className="review-list">
          {run.answers.map((a, i) => {
            const p = letterById[a.puzzleId];
            return (
              <details key={a.puzzleId}>
                <summary>
                  <span>
                    Letter {i + 1} · {recipients[p.category].name}
                  </span>
                  <strong>
                    {a.correct ? "Delivered" : "Missed"} · {a.points} pts
                  </strong>
                </summary>
                <ol className="review-claims">
                  {run.letters[i].claimIds.map((id) => (
                    <li key={id}>
                      {p.claims.find((c) => c.id === id)?.text}
                      {a.choice === id && <b> — Your choice</b>}
                      {p.falseClaimId === id && <b> — The false statement</b>}
                    </li>
                  ))}
                </ol>
                {a.timeout && <p>No answer submitted.</p>}
                <p>
                  <strong>{p.correction}</strong>
                </p>
                <p>{p.explanation}</p>
                <Sources puzzle={p} />
              </details>
            );
          })}
        </div>
      </PaperDialog>
    );
  return null;
}

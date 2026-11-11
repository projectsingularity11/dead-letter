import { AnimatePresence, motion } from "motion/react";
import type { Dispatch } from "react";
import type { Run } from "../game/types";
import type { Event } from "../game/reducer";
import { letterById } from "../content/letters";
import { recipients } from "../content/recipients";
import {
  Envelope,
  GhostPortrait,
  RubberStamp,
  DeadLetterDrawer,
  Moth,
  UtilityIcon,
  WaxSeal,
} from "../art/PostalArt";
import { ClaimGroup } from "../components/game/ClaimGroup";
import { SealControl } from "../components/game/SealControl";
import { RouteStrip } from "../components/game/RouteStrip";
import { TimerDial } from "../components/game/TimerDial";
import { RevealPanel } from "../components/game/RevealPanel";
export function PlayScreen({
  run,
  dispatch,
  reduced,
  onPause,
}: {
  run: Run;
  dispatch: Dispatch<Event>;
  reduced: boolean;
  onPause: () => void;
}) {
  const played = run.letters[run.round],
    p = letterById[played.puzzleId],
    recipient = recipients[p.category];
  const answer = run.answers[run.round];
  const ready = run.phase === "answering" && !run.paused;
  return (
    <main className="play-screen">
      <div className="shift-topline">
        <button className="text-button" onClick={onPause}>
          Pause shift
        </button>
        <span>
          THE NIGHT MAIL ·{" "}
          {run.mode === "daily" ? run.date : "NO FIXED ADDRESS"}
        </span>
      </div>
      <div className="game-workspace">
        <motion.article
          key={p.id}
          className={`letter-paper ${answer ? (answer.correct ? "reveal-correct" : "reveal-incorrect") : ""} ${run.phase === "stamping" ? "stamping" : ""} ${run.phase === "opening" ? "opening" : ""}`}
          initial={false}
          animate={{
            opacity: run.phase === "transitioning" ? 0 : 1,
            x: reduced ? 0 : run.phase === "transitioning" ? -18 : 0,
          }}
          transition={{ duration: reduced ? 0.1 : 0.18 }}
        >
          <AnimatePresence>
            {run.phase === "opening" && (
              <motion.div
                className="opening-envelope"
                key="envelope"
                aria-hidden="true"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Envelope />
              </motion.div>
            )}
          </AnimatePresence>
          {answer && (
            <div className="answer-effects" aria-hidden="true">
              {answer.correct ? (
                Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ "--i": i } as React.CSSProperties} />
                ))
              ) : (
                <Envelope />
              )}
            </div>
          )}
          <div className="letter-metadata">
            <span>
              {run.mode === "daily"
                ? "Daily shift"
                : run.mode === "relaxed"
                  ? "Relaxed practice"
                  : "Practice"}
            </span>
            <span>Letter {run.round + 1} of 6</span>
          </div>
          <div className="recipient-row">
            <GhostPortrait kind={recipient.id} />
            <div>
              <h1 tabIndex={-1}>{recipient.name}</h1>
              <p>{recipient.address}</p>
            </div>
            <span className="category">{recipient.label}</span>
          </div>
          <div className="letter-rule" />
          <p className="instruction" id="claim-instruction">
            One of these statements is false.
          </p>
          <ClaimGroup
            puzzle={p}
            played={played}
            selected={run.selected}
            onSelect={(id) => dispatch({ type: "SELECT_CLAIM", id })}
            locked={!ready}
            stamping={run.phase === "stamping"}
            answer={answer}
          />
          {!answer ? (
            <>
              <p className="selection-helper">
                {run.selected
                  ? `Statement ${"ABCD"[played.claimIds.indexOf(run.selected)]} selected.`
                  : "Choose the statement to return."}
              </p>
              <SealControl
                seals={run.seals}
                armed={run.armed}
                disabled={!ready}
                onToggle={() => dispatch({ type: "TOGGLE_SEAL" })}
              />
              <button
                className="button stamp-button"
                disabled={!ready || !run.selected}
                onClick={() => dispatch({ type: "SUBMIT" })}
              >
                RETURN TO SENDER <UtilityIcon kind="arrow" />
              </button>
              <p className="keyboard-hint">
                {!run.selected
                  ? "Choose a statement before stamping."
                  : "Enter to stamp"}{" "}
                <span>1–4 select · S seals</span>
              </p>
            </>
          ) : (
            <>
              <RevealPanel puzzle={p} answer={answer} />
              <button
                className="button next-button"
                disabled={run.phase !== "reveal"}
                onClick={() => dispatch({ type: "NEXT" })}
              >
                {run.round === 5 ? "Close the post office" : "Next letter"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
          <footer className="letter-footer">
            <div>
              <span className="small-label">CURRENT SCORE</span>
              <strong>
                {run.score}
                <small> / 800</small>
              </strong>
            </div>
            {run.mode === "relaxed" ? (
              <span className="relaxed-note">
                No clock.
                <br />
                Take your time.
              </span>
            ) : (
              <TimerDial remaining={run.remaining} />
            )}
          </footer>
        </motion.article>
        <aside className="desk-tools" aria-label="Postal tools">
          <div className="tool-stamp">
            <RubberStamp />
            <span>
              TRUTH, WITH
              <br />A FIRM HAND.
            </span>
          </div>
          <div className="tool-seals" aria-hidden="true">
            <WaxSeal />
            <WaxSeal />
          </div>
          <DeadLetterDrawer />
          <span className="drawer-label">UNDELIVERABLE</span>
          <Moth className="moth tool-moth" />
        </aside>
      </div>
      <RouteStrip run={run} />
      <p className="desk-note">A little truth. A long way home.</p>
    </main>
  );
}

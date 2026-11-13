import * as Switch from "@radix-ui/react-switch";
import * as Radio from "@radix-ui/react-radio-group";
import * as Alert from "@radix-ui/react-alert-dialog";
import type { Dispatch, SetStateAction } from "react";
import type {
  Run,
  Save,
  Preferences,
  Overlay as OverlayName,
} from "../game/types";
import type { Event } from "../game/rules";
import {
  mysteries,
  practiceMysteries,
  mysteryById,
} from "../content/mysteries";
import { solved, utcDate } from "../game/rules";
import { navigate } from "../../app/routes";
import { PixelIcon } from "./PixelIcon";
import { Overlay } from "./Overlay";
type Props = {
  overlay: OverlayName;
  confirm: boolean;
  records: Save;
  run: Run | null;
  atHome: boolean;
  close: () => void;
  dispatch: Dispatch<Event>;
  setOverlay: Dispatch<SetStateAction<OverlayName>>;
  setConfirm: Dispatch<SetStateAction<boolean>>;
  changePreferences: (p: Preferences) => Promise<void>;
  start: (mode: Run["mode"], id?: string) => void;
  reset: () => void;
};
export default function GameOverlays({
  overlay,
  confirm,
  records,
  run,
  atHome,
  close,
  dispatch,
  setOverlay,
  setConfirm,
  changePreferences,
  start,
  reset,
}: Props) {
  const mystery = run ? mysteryById[run.mysteryId] : mysteries[0];
  const terminal = (r: Run) => r.phase === "caught" || r.phase === "escaped";
  return (
    <>
      {overlay && (
        <Overlay
          title={
            overlay === "pause"
              ? "TAKE A BREATH."
              : overlay === "settings"
                ? "SETTINGS"
                : overlay === "casebook"
                  ? "CASE FILES"
                  : "GET PETE HOME."
          }
          description={
            overlay === "pause"
              ? "The ghost waits while you’re here."
              : overlay === "settings"
                ? "Saved in this browser."
                : overlay === "casebook"
                  ? "Every street has a story."
                  : "Read the page. Solve the clue. Keep moving."
          }
          onClose={close}
        >
          {overlay === "pause" ? (
            <div className="pause-actions">
              <button
                className="pixel-button"
                onClick={() => {
                  dispatch({ type: "RESUME" });
                  setOverlay(null);
                }}
              >
                RESUME GAME
                <PixelIcon name="arrow" />
              </button>
              <button
                className="flat-button"
                onClick={() => {
                  setOverlay(null);
                  navigate("/");
                }}
              >
                Back to street
              </button>
            </div>
          ) : overlay === "settings" ? (
            <>
              <label className="night-setting">
                <span>Sound effects</span>
                <Switch.Root
                  className="pixel-switch"
                  checked={records.preferences.sound}
                  onCheckedChange={(v) =>
                    void changePreferences({ ...records.preferences, sound: v })
                  }
                >
                  <Switch.Thumb />
                </Switch.Root>
              </label>
              <fieldset className="night-motion">
                <legend>Motion</legend>
                <Radio.Root
                  aria-label="Motion"
                  value={records.preferences.motion}
                  onValueChange={(v) =>
                    void changePreferences({
                      ...records.preferences,
                      motion: v as Preferences["motion"],
                    })
                  }
                >
                  {["system", "reduced", "full"].map((v) => (
                    <label key={v}>
                      <Radio.Item value={v}>
                        <Radio.Indicator />
                      </Radio.Item>
                      {v[0].toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                </Radio.Root>
              </fieldset>
              <p>
                Reduced motion stops rain, flicker and walking loops. The
                ghost’s distance still counts down.
              </p>
              <button className="reset-button" onClick={() => setConfirm(true)}>
                Reset local runs
              </button>
            </>
          ) : overlay === "how" ? (
            <div className="how-rules">
              <p>
                <b>1.</b> Pete finds eight connected pages. Each clue is harder
                than the last.
              </p>
              <p>
                <b>2.</b> The ghost advances while you think. A correct answer
                banishes it. A wrong answer brings it closer.
              </p>
              <p>
                <b>3.</b> If it reaches Pete, the run ends. Your score comes
                from how far you get: 100, 200, 300… points per solved clue.
              </p>
              <p>
                Type every requested fact, then press Enter or Submit deduction.
                Wrong deductions cost 35% of the page’s time; three different
                wrong deductions are fatal. Formatting errors cost nothing.
                Pause with Escape. Questions refer only to the fictional
                evidence on the pages; the final clue may refer to earlier
                pages.
              </p>
              <p>
                100 cases are scheduled from 13 November 2026 through 20
                February 2027. Daily changes at 00:00 UTC, including in an open
                tab. An unfinished run keeps its original date. Practice and the
                tutorial never use your Daily attempt. Records stay in this
                browser.
              </p>
              <button
                className="pixel-button"
                onClick={() => start("tutorial")}
              >
                PLAY TUTORIAL <PixelIcon name="arrow" />
              </button>
            </div>
          ) : (
            <div className="case-list">
              {run && !atHome ? (
                <>
                  {mystery.clues
                    .slice(
                      0,
                      solved(run) +
                        (terminal(run) && run.phase === "caught" ? 1 : 0),
                    )
                    .map((c, i) => {
                      const win = run.answers.find(
                        (a) => a.clueId === c.id && a.correct,
                      );
                      const accessible = !!win || terminal(run);
                      return (
                        <details key={c.id}>
                          <summary>
                            <span>
                              {String(i + 1).padStart(2, "0")} / {c.title}
                            </span>
                            <small>{win ? "SOLVED" : "LAST PAGE"}</small>
                          </summary>
                          <p>{c.evidence}</p>
                          {accessible && (
                            <>
                              <p>
                                <b>{c.question}</b>
                              </p>
                              <p>
                                Answer:{" "}
                                {c.fields
                                  .map((f) => `${f.label}: ${f.answer}`)
                                  .join(" · ")}
                              </p>
                              <p>{c.explanation}</p>
                            </>
                          )}
                        </details>
                      );
                    })}
                  {solved(run) === 0 && !terminal(run) && (
                    <p>No pages solved yet.</p>
                  )}
                </>
              ) : (
                [...practiceMysteries, ...mysteries].map((m, i) => (
                  <div className="case-row" key={m.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{m.title}</h3>
                      <p>
                        {m.location} · {m.number ? m.date : "PRACTICE"}
                        {m.date > utcDate() ? " · LOCKED" : ""}
                      </p>
                    </div>
                    <button
                      aria-label={`Practice ${m.title}`}
                      disabled={m.date > utcDate()}
                      title={
                        m.date > utcDate()
                          ? `Unlocks ${m.date} at 00:00 UTC`
                          : undefined
                      }
                      onClick={() => start("practice", m.id)}
                    >
                      <PixelIcon name="arrow" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </Overlay>
      )}
      {confirm && (
        <Alert.Root
          open
          onOpenChange={(open) => {
            if (!open) setConfirm(false);
          }}
        >
          <Alert.Portal>
            <Alert.Overlay className="night-backdrop" />
            <Alert.Content className="night-dialog">
              <Alert.Title>ERASE LOCAL RUNS?</Alert.Title>
              <Alert.Description>
                This clears Night Walk progress and preferences in this browser.
                It cannot be undone.
              </Alert.Description>
              <div className="confirm-actions">
                <Alert.Cancel
                  className="pixel-button"
                  onClick={() => setConfirm(false)}
                >
                  KEEP RUNS
                </Alert.Cancel>
                <Alert.Action
                  className="flat-button danger-text"
                  onClick={reset}
                >
                  Erase runs
                </Alert.Action>
              </div>
            </Alert.Content>
          </Alert.Portal>
        </Alert.Root>
      )}
    </>
  );
}

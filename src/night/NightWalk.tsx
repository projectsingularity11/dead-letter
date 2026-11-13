import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import type {
  Run,
  Overlay as OverlayName,
  Save,
  Preferences,
} from "./game/types";
import {
  makeRun,
  reducer,
  commit,
  duration,
  solved,
  clueCount,
  resultText,
} from "./game/rules";
import type { Event } from "./game/rules";
import { readSave, writeSave, clearSave, emptySave } from "./game/storage";
import {
  mysteries,
  practiceMysteries,
  mysteryById,
  dailyMystery,
  SCHEDULE_END,
} from "./content/mysteries";
import { StreetScene } from "./art/StreetScene";
import { PixelIcon } from "./components/PixelIcon";
import { activate, sound, atmosphere } from "../audio/engine";
import { useRoute, navigate } from "../app/routes";
import { AnswerForm } from "./components/AnswerForm";
import { useDailyClock } from "./components/DailyClock";
const GameOverlays = lazy(() => import("./components/GameOverlays"));
function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(query.matches);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  return reduced;
}
function terminal(r: Run) {
  return r.phase === "caught" || r.phase === "escaped";
}
function dateLabel(date: string) {
  return new Date(`${date}T12:00:00Z`)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}
export function NightWalk() {
  const [loaded] = useState(() => readSave());
  const [records, setRecords] = useState(loaded.save);
  const route = useRoute();
  const [run, rawDispatch] = useReducer(reducer, loaded.save.active);
  const [overlay, setOverlay] = useState<OverlayName>(
    route === "/play" && loaded.save.active && !terminal(loaded.save.active)
      ? "pause"
      : null,
  );
  const [confirm, setConfirm] = useState(false),
    [toast, setToast] = useState(loaded.message),
    [cannotSave, setCannotSave] = useState(
      loaded.message.includes("cannot be saved"),
    ),
    [copiedFallback, setCopiedFallback] = useState(false);
  const { today, countdown } = useDailyClock();
  const systemReduced = useSystemReducedMotion();
  const reduced =
    records.preferences.motion === "reduced" ||
    (records.preferences.motion === "system" && !!systemReduced);
  const lastTick = useRef<number | null>(null);
  const flush = useCallback(() => {
    if (lastTick.current === null) return;
    const now = performance.now();
    rawDispatch({ type: "TICK", elapsed: now - lastTick.current });
    lastTick.current = now;
  }, []);
  const dispatch = useCallback(
    (event: Event) => {
      flush();
      rawDispatch(event);
    },
    [flush],
  );
  const snapshot = useRef<Save>(records),
    current = useRef(run);
  current.current = run;
  snapshot.current = commit(records, run);
  const persist = useCallback(() => {
    if (!writeSave(snapshot.current)) setCannotSave(true);
  }, []);
  const checkpoint = useRef("");
  useLayoutEffect(() => {
    const value = JSON.stringify([
      run?.id,
      run?.phase,
      run?.clue,
      run?.answers.length,
      run?.paused,
      records.preferences,
    ]);
    if (value !== checkpoint.current) {
      checkpoint.current = value;
      persist();
    }
  }, [run, records, persist]);
  useEffect(() => {
    if (run) setRecords((prev) => commit(prev, run));
  }, [run?.id, run?.phase, run?.clue, run?.answers.length, run?.paused]);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const active =
    !!run &&
    run.phase === "answering" &&
    !run.paused &&
    !overlay &&
    !confirm &&
    route === "/play";
  useEffect(() => {
    if (!active) {
      lastTick.current = null;
      return;
    }
    lastTick.current = performance.now();
    const t = setInterval(flush, 80);
    return () => {
      clearInterval(t);
      flush();
      lastTick.current = null;
    };
  }, [active, flush]);
  useEffect(() => {
    if (run?.phase !== "walking" || run.paused || overlay || route !== "/play")
      return;
    const t = setTimeout(
      () => dispatch({ type: "ARRIVE" }),
      reduced ? 120 : 1250,
    );
    return () => clearTimeout(t);
  }, [run?.phase, run?.paused, run?.clue, overlay, route, reduced, dispatch]);
  useEffect(() => {
    const interval = setInterval(persist, 1000);
    const hide = () => {
      const r = current.current;
      if (r && !terminal(r) && route === "/play") {
        flush();
        rawDispatch({ type: "PAUSE" });
        setOverlay("pause");
        snapshot.current = commit(snapshot.current, { ...r, paused: true });
      }
      persist();
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    document.addEventListener("visibilitychange", visibility);
    addEventListener("pagehide", hide);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
      removeEventListener("pagehide", hide);
    };
  }, [route, flush, persist]);
  useEffect(() => {
    if (route === "/play" && !run) navigate("/");
    if (route === "/results" && (!run || !terminal(run)))
      navigate(run ? "/play" : "/");
    if (run && terminal(run) && route === "/play") navigate("/results");
  }, [route, run]);
  useEffect(() => {
    if (route !== "/play") return;
    if (run?.phase === "intro")
      document
        .querySelector<HTMLElement>("#prologue-title")
        ?.focus({ preventScroll: true });
    if (run?.phase === "answering")
      document.querySelector<HTMLElement>(".clue-question")?.focus();
    if (run?.phase === "banished")
      document.querySelector<HTMLElement>(".banish-title")?.focus();
  }, [run?.phase, run?.clue, route]);
  const lastAnswer = useRef("");
  useEffect(() => {
    const a = run?.answers.at(-1);
    const key = a ? `${run?.id}:${run?.answers.length}` : "";
    if (key && key !== lastAnswer.current && records.preferences.sound)
      sound(a?.correct ? "correct" : "incorrect");
    lastAnswer.current = key;
  }, [run?.answers.length, run?.id, records.preferences.sound, run]);
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        overlay ||
        confirm ||
        route !== "/play" ||
        !run ||
        run.paused
      )
        return;
      const target = e.target as HTMLElement;
      if (e.key === "Escape") {
        e.preventDefault();
        pause("pause");
        return;
      }
      if (target.closest("input,textarea,[contenteditable=true]")) return;
      if (
        run.phase === "banished" &&
        e.key === "Enter" &&
        !target.closest("button")
      ) {
        e.preventDefault();
        dispatch({ type: "NEXT" });
      }
    };
    addEventListener("keydown", keyboard);
    return () => removeEventListener("keydown", keyboard);
  }, [run, overlay, confirm, route, dispatch]);
  function pause(name: OverlayName) {
    dispatch({ type: "PAUSE" });
    setOverlay(name);
  }
  function close() {
    if (overlay === "pause") {
      setOverlay(null);
      navigate("/");
      return;
    }
    setOverlay(null);
    if (route === "/play") dispatch({ type: "RESUME" });
  }
  function resume(saved: Run) {
    dispatch({ type: "RESTORE", run: { ...saved, paused: !terminal(saved) } });
    navigate(terminal(saved) ? "/results" : "/play");
    if (!terminal(saved)) setOverlay("pause");
  }
  function start(mode: Run["mode"] = "daily", sameMystery?: string) {
    const existing = mode === "daily" ? records.daily[today] : null;
    if (existing) {
      resume(existing);
      return;
    }
    const practicePool = [
      ...practiceMysteries,
      ...mysteries.filter((m) => m.date < today),
    ].filter(
      (m) =>
        m.id !== records.practice?.mysteryId &&
        m.id !== dailyMystery(today)?.id,
    );
    const id =
      mode === "practice"
        ? (sameMystery ??
          practicePool[Math.floor(Math.random() * practicePool.length)].id)
        : undefined;
    if (mode === "daily" && !dailyMystery(today)) {
      setToast("No case is scheduled for today. Practice is available.");
      return;
    }
    dispatch({
      type: "START",
      run: makeRun(mode, today, mode === "tutorial" ? "tutorial" : id),
    });
    setCopiedFallback(false);
    setOverlay(null);
    navigate("/play");
    if (records.preferences.sound) sound("paper");
  }
  async function changePreferences(p: Preferences) {
    if (p.sound && !records.preferences.sound) {
      const ready = await activate();
      if (!ready) setToast("Audio is unavailable. You can keep playing.");
    }
    if (!p.sound) atmosphere(false);
    setRecords((prev) => ({ ...prev, preferences: p }));
  }
  function reset() {
    const ok = clearSave();
    rawDispatch({ type: "RESET" });
    current.current = null;
    setRecords(emptySave());
    snapshot.current = emptySave();
    setConfirm(false);
    setOverlay(null);
    navigate("/");
    setCannotSave(!ok);
    setToast(
      ok
        ? "Local records cleared."
        : "Progress cannot be saved in this browser.",
    );
  }
  async function copy() {
    if (!run) return;
    try {
      await navigator.clipboard.writeText(resultText(run));
      setToast("Run copied.");
      setCopiedFallback(false);
    } catch {
      setCopiedFallback(true);
      setToast("Select and copy your result below.");
    }
  }
  const daily = records.daily[today];
  const scheduled = dailyMystery(today);
  const preview = scheduled ?? mysteries.at(-1)!;
  const mystery = run ? mysteryById[run.mysteryId] : preview;
  const clue = run ? mystery.clues[run.clue] : null;
  const atHome = route === "/";
  const total = run ? clueCount(run) : 8;
  const intro = run?.phase === "intro";
  const safeLesson = run?.mode === "tutorial" && run.clue === 0;
  const result = route === "/results" && run && terminal(run);
  const answering = run?.phase === "answering";
  const banished = run?.phase === "banished";
  const meters = run
    ? Math.max(0, Math.ceil((run.remaining / duration(run)) * 30))
    : 30;
  return (
    <div
      className={`night-app ${atHome ? "on-title" : "in-run"}`}
      data-phase={atHome ? "home" : run?.phase}
    >
      <a
        className="night-skip"
        href="#night-main"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector<HTMLElement>("main button")?.focus();
        }}
      >
        Skip to game
      </a>
      <main id="night-main" className="night-main">
        <section
          className={`street-frame ${atHome ? "title-scene" : ""} ${result ? "result-scene" : ""}`}
          aria-label="Pete’s night walk"
        >
          <StreetScene
            run={atHome ? null : run}
            reduced={reduced}
            home={atHome}
          />
          <header className="night-header">
            <a
              className="night-wordmark"
              href="#/"
              onClick={() => {
                dispatch({ type: "PAUSE" });
                setOverlay(null);
              }}
              aria-label="Dead Letter home"
            >
              <PixelIcon name="ghost" />
              <span>DEAD LETTER</span>
            </a>
            <span className="header-date">
              {dateLabel(atHome ? today : (run?.date ?? today))} <span>·</span>{" "}
              {atHome || run?.mode === "daily"
                ? "DAILY MYSTERY"
                : run?.mode === "tutorial"
                  ? "TUTORIAL"
                  : "PRACTICE RUN"}
            </span>
            <nav
              aria-label="Game controls"
              onPointerEnter={() => void import("./components/GameOverlays")}
            >
              {route === "/play" && (
                <button
                  className="night-icon"
                  aria-label="Pause game"
                  onClick={() => pause("pause")}
                >
                  <PixelIcon name="pause" />
                </button>
              )}
              <button
                className="night-icon"
                aria-label={
                  records.preferences.sound ? "Mute sound" : "Enable sound"
                }
                aria-pressed={records.preferences.sound}
                onClick={() =>
                  void changePreferences({
                    ...records.preferences,
                    sound: !records.preferences.sound,
                  })
                }
              >
                <PixelIcon
                  name={records.preferences.sound ? "sound" : "mute"}
                />
              </button>
              <button
                className="night-icon"
                aria-label="How to play"
                onClick={() => pause("how")}
              >
                <PixelIcon name="help" />
              </button>
              <button
                className="night-icon"
                aria-label="Settings"
                onClick={() => pause("settings")}
              >
                <PixelIcon name="settings" />
              </button>
            </nav>
          </header>
          <div className="scene-corner corner-tl" />
          <div className="scene-corner corner-tr" />
          <div className="scene-corner corner-bl" />
          <div className="scene-corner corner-br" />
          {atHome ? (
            <>
              <div className="title-overlay">
                <h1 data-title="DEAD LETTER">
                  DEAD
                  <span>
                    LETTER<span className="title-period">.</span>
                  </span>
                </h1>
                <p>
                  The city has a secret.
                  <br />
                  Get Pete home before it catches him.
                </p>
              </div>
              <div className="title-start">
                <button
                  className="pixel-button start-game"
                  disabled={!scheduled}
                  onClick={() => start("daily")}
                >
                  {daily
                    ? terminal(daily)
                      ? "VIEW TODAY’S RUN"
                      : "RESUME GAME"
                    : scheduled
                      ? "START GAME"
                      : "SEASON COMPLETE"}
                  <PixelIcon name="arrow" />
                </button>
                <button
                  className="tutorial-link"
                  onClick={() => start("tutorial")}
                >
                  {records.tutorialComplete
                    ? "REPLAY TUTORIAL"
                    : "FIRST NIGHT? PLAY THE TUTORIAL"}
                  <PixelIcon name="arrow" />
                </button>
              </div>
              <div className="scene-location">
                <span className="status-dot" /> {preview.location}
              </div>
              <span className="scene-weather">12°C · LIGHT RAIN</span>
            </>
          ) : result ? (
            <div
              className={`ending-overlay ${run.phase === "escaped" ? "escaped" : "dead"}`}
            >
              <span className="ending-pixel">
                <PixelIcon name={run.phase === "escaped" ? "home" : "ghost"} />
              </span>
              <h1>
                {run.phase === "escaped"
                  ? run.mode === "tutorial"
                    ? "YOU KNOW THE WAY."
                    : "PETE MADE IT HOME."
                  : "THE GHOST GOT PETE."}
              </h1>
              <p>
                {run.phase === "escaped"
                  ? mystery.ending
                  : "The street keeps its secrets. For now."}
              </p>
            </div>
          ) : (
            run && (
              <>
                <div className="run-hud">
                  <div>
                    <span className="hud-label">
                      {run.mode === "daily"
                        ? "DAILY"
                        : run.mode === "tutorial"
                          ? "TUTORIAL"
                          : "PRACTICE"}{" "}
                      / {mystery.location}
                    </span>
                    <strong>{mystery.title}</strong>
                  </div>
                  <div className="hud-right">
                    <span className="hud-label">SCORE</span>
                    <strong>{String(run.score).padStart(4, "0")}</strong>
                  </div>
                </div>
                {!intro && (
                  <div
                    className={`pursuit-readout ${meters <= 8 ? "danger" : ""}`}
                  >
                    <PixelIcon name="ghost" />
                    <div>
                      <span>
                        {safeLesson
                          ? "SAFE STREET · NO TIMER"
                          : run.phase === "walking"
                            ? "THE STREET IS QUIET"
                            : banished
                              ? "GHOST BANISHED"
                              : run.paused || overlay
                                ? "CHASE PAUSED"
                                : "IT’S GETTING CLOSER"}
                      </span>
                      <div className="distance-track" aria-hidden="true">
                        <i
                          style={{
                            width: `${run.phase === "banished" ? 0 : (run.remaining / duration(run)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <strong
                      role="timer"
                      aria-label={
                        safeLesson
                          ? "Safe tutorial. No timer."
                          : `Ghost ${meters} metres away`
                      }
                    >
                      {safeLesson ? "SAFE" : banished ? "—" : `${meters}m`}
                    </strong>
                  </div>
                )}
                {run.phase === "walking" && (
                  <div className="walking-caption" role="status">
                    <PixelIcon name="note" />
                    <span>Pete found a page.</span>
                  </div>
                )}
                {banished && (
                  <div className="banished-callout" aria-hidden="true">
                    BANISHED
                  </div>
                )}
                <span className="pete-caption" aria-hidden="true">
                  PETE
                  <i />
                </span>
                <div className="stage-bottom">
                  <span>
                    {run.mode === "tutorial" ? "LESSON" : "BLOCK"}{" "}
                    {String(run.clue + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                  <span>{clue?.difficulty.toUpperCase()}</span>
                </div>
              </>
            )
          )}
        </section>
        {atHome ? (
          <>
            <section className="daily-strip" aria-label="Today’s mystery">
              <div className="daily-mark">
                <PixelIcon name="note" />
                <span>
                  {dateLabel(today)}
                  <small>NEXT CASE IN</small>
                  <strong className="reset-countdown">{countdown}</strong>
                  <small>MIDNIGHT UTC</small>
                </span>
              </div>
              <div className="daily-description">
                <span className="case-date">
                  CASE {String(preview.number).padStart(3, "0")} ·{" "}
                  {dateLabel(today)}
                </span>
                <h2>{preview.title}</h2>
                <p>
                  {scheduled
                    ? preview.intro
                    : `This 100-night season ended ${SCHEDULE_END}. Every case remains available in Practice.`}
                </p>
              </div>
              <div className="daily-actions">
                <button onClick={() => start("practice")}>
                  Play another mystery <PixelIcon name="arrow" />
                </button>
                <button onClick={() => pause("casebook")}>
                  Case files <span>100</span>
                </button>
              </div>
            </section>
            <section className="street-story" aria-labelledby="meet-pete">
              <div className="story-sign">
                <PixelIcon name="note" />
              </div>
              <div>
                <h2 id="meet-pete">He only wanted to get home.</h2>
                <p>
                  An empty street. A page in a puddle. A ghost that moves every
                  time Pete stops. Eight pages connect tonight’s mystery. Read
                  carefully, follow the evidence, and type your deductions to
                  keep him alive.
                </p>
                <button
                  className="flat-button"
                  onClick={() => start("tutorial")}
                >
                  Walk the first street with Pete <PixelIcon name="arrow" />
                </button>
              </div>
              <div className="story-rules">
                <span>READ THE PAGE</span>
                <i />
                <span>MAKE THE CONNECTION</span>
                <i />
                <span>BANISH THE GHOST</span>
              </div>
            </section>
            {records.active &&
              (records.active.mode === "practice" ||
                records.active.date !== today) &&
              !terminal(records.active) && (
                <button
                  className="resume-practice"
                  onClick={() => resume(records.active!)}
                >
                  Resume unfinished{" "}
                  {records.active.mode === "practice" ? "practice" : "Daily"}{" "}
                  run
                </button>
              )}
          </>
        ) : result ? (
          <section className="run-result" aria-label="Run result">
            <div className="result-stats">
              <div>
                <span>CLUES SOLVED</span>
                <strong>
                  {solved(run)}
                  <small>/{total}</small>
                </strong>
              </div>
              <div>
                <span>FINAL SCORE</span>
                <strong>{run.score}</strong>
              </div>
              <div>
                <span>LOCAL BEST</span>
                <strong>{Math.max(records.best, run.score)}</strong>
              </div>
            </div>
            <ol className="evidence-route" aria-label="Clue outcomes">
              {mystery.clues.map((c, i) => (
                <li
                  key={c.id}
                  className={
                    i < solved(run)
                      ? "complete"
                      : i === run.clue && run.phase === "caught"
                        ? "lost"
                        : ""
                  }
                  aria-label={`Clue ${i + 1}: ${i < solved(run) ? "solved" : i === run.clue && run.phase === "caught" ? "caught" : "unreached"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </li>
              ))}
            </ol>
            <div className="result-buttons">
              <button
                className="pixel-button"
                onClick={() =>
                  start(
                    run.mode === "tutorial" ? "daily" : "practice",
                    run.mode === "tutorial" ? undefined : mystery.id,
                  )
                }
              >
                {run.mode === "tutorial" ? "START DAILY MYSTERY" : "TRY AGAIN"}{" "}
                <PixelIcon name="arrow" />
              </button>
              <button className="flat-button" onClick={copy}>
                Copy result
              </button>
              <button className="flat-button" onClick={() => pause("casebook")}>
                Review clues
              </button>
              <button className="flat-button" onClick={() => navigate("/")}>
                Back to street
              </button>
            </div>
            {copiedFallback && (
              <label className="result-copy">
                Copy your run
                <textarea
                  readOnly
                  value={resultText(run)}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </label>
            )}
          </section>
        ) : intro ? (
          <section className="prologue" aria-labelledby="prologue-title">
            <div className="prologue-voice">
              <PixelIcon name="note" />
              <span>PETE / 00:07</span>
            </div>
            <div>
              <h1 id="prologue-title" tabIndex={-1}>
                “That page wasn’t here a moment ago.”
              </h1>
              <p>{mystery.intro}</p>
              <p>
                A light flickers. Something moves behind Pete. Eight pieces of
                evidence will lead him home. The ghost starts moving when you
                pick up the first page.
              </p>
              <button
                className="pixel-button"
                onClick={() => dispatch({ type: "BEGIN" })}
              >
                PICK UP THE PAGE <PixelIcon name="arrow" />
              </button>
              <button className="flat-button" onClick={() => start("tutorial")}>
                Learn on a safe street first
              </button>
            </div>
          </section>
        ) : (
          run &&
          clue && (
            <section
              className={`clue-console ${run.phase === "walking" ? "paper-arriving" : ""}`}
              aria-label="The found page"
            >
              <div
                className={`mobile-threat ${meters <= 8 ? "danger" : ""}`}
                aria-hidden="true"
              >
                <PixelIcon name="ghost" />
                <span>
                  {safeLesson
                    ? "SAFE"
                    : banished
                      ? "BANISHED"
                      : run.paused || overlay
                        ? "PAUSED"
                        : "GHOST"}
                </span>
                <div className="distance-track">
                  <i
                    style={{
                      width: `${banished ? 0 : (run.remaining / duration(run)) * 100}%`,
                    }}
                  />
                </div>
                <strong>{safeLesson || banished ? "—" : `${meters}m`}</strong>
              </div>
              <div className="clue-evidence">
                <div className="clue-meta">
                  <PixelIcon name="note" />
                  <span>
                    {run.mode === "tutorial" ? "LESSON" : "CLUE"}{" "}
                    {String(run.clue + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </span>
                  <span>
                    {clue.difficulty === "final"
                      ? "THE LAST QUESTION"
                      : clue.difficulty.toUpperCase()}
                  </span>
                </div>
                <h1>{clue.title}</h1>
                <p className="evidence-text">{clue.evidence}</p>
                <ol className="mini-route" aria-label="Mystery progress">
                  {mystery.clues.map((c, i) => (
                    <li
                      key={c.id}
                      className={
                        i < solved(run)
                          ? "done"
                          : i === run.clue
                            ? "current"
                            : ""
                      }
                      aria-label={`Clue ${i + 1}${i < solved(run) ? " solved" : i === run.clue ? " current" : ""}`}
                    />
                  ))}
                </ol>
                {run.clue > 0 && (
                  <button
                    className="earlier-pages"
                    onClick={() => pause("casebook")}
                  >
                    Earlier pages <PixelIcon name="arrow" />
                  </button>
                )}
              </div>
              <div className="clue-interaction">
                {banished ? (
                  <div className="banish-panel">
                    <h3 className="banish-title" tabIndex={-1}>
                      You bought another block.
                    </h3>
                    <p>{clue.explanation}</p>
                    <div className="banish-actions">
                      <span>
                        {run.mode === "tutorial"
                          ? "LESSON COMPLETE"
                          : `+${(run.clue + 1) * 100} POINTS`}
                      </span>
                      <button
                        className="pixel-button"
                        onClick={() => dispatch({ type: "NEXT" })}
                      >
                        {run.clue === total - 1
                          ? "GET PETE HOME"
                          : "NEXT BLOCK"}
                        <PixelIcon name="arrow" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="clue-question" tabIndex={-1}>
                      {clue.question}
                    </h2>
                    <AnswerForm
                      key={`${run.id}:${clue.id}`}
                      clue={clue}
                      disabled={!answering || run.paused || !!overlay}
                      misses={run.misses}
                      safe={safeLesson}
                      onAnswer={(values) =>
                        dispatch({ type: "ANSWER", values })
                      }
                    />
                    {run.mode === "tutorial" && (
                      <p className="tutorial-coach">
                        {run.clue === 0
                          ? "SAFE STREET · No timer on this page. Type 24 and MOTH, then submit."
                          : "The ghost is moving. Type 01:10 and submit to banish it. Pause with Escape, even while typing."}
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          )
        )}
      </main>
      <footer className="night-footer">
        <span>
          <span className="status-dot" />{" "}
          {atHome ? "DAILY RESETS AT 00:00 UTC." : "ESC TO PAUSE."}
        </span>
        <button onClick={() => pause("how")}>HOW TO PLAY</button>
        <span>{records.preferences.sound ? "SOUND ON" : "SOUND OFF"}</span>
      </footer>
      {(overlay || confirm) && (
        <Suspense
          fallback={
            <div className="night-toast" role="status">
              Opening menu…
            </div>
          }
        >
          <GameOverlays
            overlay={overlay}
            confirm={confirm}
            records={records}
            run={run}
            atHome={atHome}
            close={close}
            dispatch={dispatch}
            setOverlay={setOverlay}
            setConfirm={setConfirm}
            changePreferences={changePreferences}
            start={start}
            reset={reset}
          />
        </Suspense>
      )}
      <div className="night-toast" role="status">
        {cannotSave ? "Progress cannot be saved in this browser." : toast}
      </div>
    </div>
  );
}

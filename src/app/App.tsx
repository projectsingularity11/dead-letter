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
import * as Tooltip from "@radix-ui/react-tooltip";
import { MotionConfig, useReducedMotion } from "motion/react";
import { HomeScreen } from "../screens/HomeScreen";
import { PlayScreen } from "../screens/PlayScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { PostalScene } from "../components/world/PostalScene";
import { PostalCrest, UtilityIcon } from "../art/PostalArt";
import { IconButton } from "../components/ui/IconButton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
const Overlays = lazy(() =>
  import("../overlays/Overlays").then((m) => ({ default: m.Overlays })),
);

import { load, save, freshRecords, clearRecords } from "../game/persistence";
import { reducer } from "../game/reducer";
import { makeRun, utcDate } from "../game/daily";
import { finishRecords } from "../game/achievements";
import { letterById } from "../content/letters";
import { useActiveTimer } from "../game/timer";
import type { Modal, Mode, Preferences, Records, Run } from "../game/types";
import { navigate, useRoute } from "./routes";
import { activate, sound, atmosphere } from "../audio/engine";
type Saved = Records & { activeId?: string };
function storedRun(records: Saved): Run | null {
  const all = [
    ...Object.values(records.daily),
    ...(records.practice ? [records.practice] : []),
  ];
  return (
    all.find((r) => r.id === records.activeId) ??
    records.daily[utcDate()] ??
    records.practice ??
    null
  );
}
export function App() {
  const [initial] = useState(() => load());
  const [records, setRecords] = useState<Saved>(initial.records);
  const [run, rawDispatch] = useReducer(
    reducer,
    location.hash === "#/play" || location.hash === "#/results"
      ? storedRun(initial.records)
      : null,
  );
  const [modal, setModal] = useState<Modal>(
    run && run.phase !== "results" ? "resume" : null,
  );
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState(initial.message);
  const [storageWarning, setStorageWarning] = useState(
    initial.message.includes("can’t be saved"),
  );
  const [audioFailed, setAudioFailed] = useState(false);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [tutorialStart, setTutorialStart] = useState(false);
  const route = useRoute();
  const [, setToday] = useState(utcDate);
  useEffect(() => {
    const t = setInterval(() => setToday(utcDate()), 15000);
    return () => clearInterval(t);
  }, []);
  const systemReduced = useReducedMotion();
  const reduced =
    records.preferences.motion === "reduced" ||
    (records.preferences.motion === "system" && !!systemReduced);
  const flush = useActiveTimer(
    !!run &&
      run.phase === "answering" &&
      !run.paused &&
      !modal &&
      !confirm &&
      route === "/play" &&
      run.mode !== "relaxed",
    rawDispatch,
  );
  const dispatch = useCallback(
    (event: import("../game/reducer").Event) => {
      flush();
      if (event.type === "SELECT_CLAIM" && records.preferences.sound)
        sound("select");
      rawDispatch(event);
    },
    [flush, records.preferences.sound],
  );
  const snapshot = useRef<Saved>(records);
  const runRef = useRef(run);
  runRef.current = run;
  const notify = useCallback((s: string) => setToast(s), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  useEffect(() => {
    setRecords((prev) => {
      if (!run) return prev;
      const next: Saved = {
        ...prev,
        activeId: run.id,
        ...(run.mode === "daily"
          ? { daily: { ...prev.daily, [run.date]: run } }
          : { practice: run }),
      };
      return run.phase === "results" ? finishRecords(next, run) : next;
    });
  }, [run]);
  // Keep the freshest snapshot in memory. Durable writes are bounded to checkpoints.
  const current: Saved = run
    ? {
        ...records,
        activeId: run.id,
        ...(run.mode === "daily"
          ? { daily: { ...records.daily, [run.date]: run } }
          : { practice: run }),
      }
    : records;
  snapshot.current =
    run?.phase === "results" ? finishRecords(current, run) : current;
  const persist = useCallback(() => {
    if (!save(snapshot.current)) {
      setStorageWarning(true);
    }
  }, []);
  const savedCheckpoint = useRef("");
  useLayoutEffect(() => {
    const checkpoint = JSON.stringify([
      run?.id,
      run?.phase,
      run?.selected,
      run?.armed,
      run?.paused,
      records.preferences,
      records.tutorialDone,
      records.collection,
    ]);
    if (checkpoint !== savedCheckpoint.current) {
      savedCheckpoint.current = checkpoint;
      persist();
    }
  }, [records, run, persist]);
  useEffect(() => {
    const t = setInterval(persist, 1000);
    const hide = () => {
      const r = runRef.current;
      if (r && r.phase !== "results" && route === "/play") {
        dispatch({ type: "PAUSE" });
        setModal("resume");
        const paused = { ...r, paused: true };
        snapshot.current = {
          ...snapshot.current,
          ...(r.mode === "daily"
            ? { daily: { ...snapshot.current.daily, [r.date]: paused } }
            : { practice: paused }),
        };
      }
      persist();
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    addEventListener("pagehide", hide);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(t);
      removeEventListener("pagehide", hide);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [persist, route]);

  useEffect(() => {
    if (run?.phase === "answering" && run.remaining <= 0 && !modal && !confirm)
      dispatch({ type: "TIMEOUT" });
  }, [run?.remaining, run?.phase, modal, confirm]);
  useEffect(() => {
    if (!run || run.paused || modal || confirm || route !== "/play") return;
    const event =
      run.phase === "opening"
        ? "OPENING_COMPLETE"
        : run.phase === "stamping"
          ? "STAMP_COMPLETE"
          : run.phase === "transitioning"
            ? "TRANSITION_COMPLETE"
            : null;
    if (!event) return;
    const duration =
      run.phase === "opening" ? 620 : run.phase === "stamping" ? 360 : 180;
    const t = setTimeout(
      () => dispatch({ type: event }),
      reduced ? 100 : duration,
    );
    return () => clearTimeout(t);
  }, [run?.phase, run?.paused, modal, confirm, route, reduced]);
  const previousPhase = useRef(run?.phase);
  useEffect(() => {
    if (previousPhase.current !== run?.phase) {
      if (records.preferences.sound) {
        if (run?.phase === "opening") sound("paper");
        if (run?.phase === "stamping") sound("stamp");
        if (run?.phase === "reveal")
          sound(run.answers.at(-1)?.correct ? "correct" : "incorrect");
        if (run?.phase === "results") sound("results");
      }
      if (run?.phase === "results") {
        const next = finishRecords(records, run);
        setUnlocks(
          next.collection.filter((id) => !records.collection.includes(id)),
        );
        navigate("/results");
      }
      if (run?.phase === "answering")
        document.querySelector<HTMLElement>(".recipient-row h1")?.focus();
      if (run?.phase === "reveal")
        document.querySelector<HTMLElement>(".reveal-heading h2")?.focus();
      if (run?.phase === "results")
        document.querySelector<HTMLElement>(".result-receipt h1")?.focus();
      previousPhase.current = run?.phase;
    }
  }, [run?.phase, records.preferences.sound, run]);
  useEffect(() => {
    if (route === "/results" && run?.phase !== "results")
      navigate(run ? "/play" : "/");
    if (route === "/play" && !run) {
      const waiting = storedRun(records);
      if (waiting) {
        dispatch({ type: "RESTORE", run: waiting });
        if (waiting.phase !== "results") setModal("resume");
        else navigate("/results");
      } else navigate("/");
    }
  }, [route, run, records, dispatch]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        modal ||
        confirm ||
        route !== "/play" ||
        !run ||
        run.paused
      )
        return;
      const target = e.target as HTMLElement;
      if (target.closest('input,textarea,[contenteditable="true"]')) return;
      if (
        e.key === "Enter" &&
        target.closest("button") &&
        !target.closest("[role=radio],.stamp-button,.next-button")
      )
        return;
      if (run.phase === "answering") {
        if (/^[1-4]$/.test(e.key)) {
          e.preventDefault();
          dispatch({
            type: "SELECT_CLAIM",
            id: run.letters[run.round].claimIds[Number(e.key) - 1],
          });
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          dispatch({ type: "TOGGLE_SEAL" });
        } else if (e.key === "Enter" && run.selected) {
          e.preventDefault();
          dispatch({ type: "SUBMIT" });
        }
      } else if (run.phase === "reveal" && e.key === "Enter") {
        e.preventDefault();
        dispatch({ type: "NEXT" });
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [run, route, modal, confirm, records.preferences.sound]);
  function open(m: Modal) {
    if (run?.phase === "answering") dispatch({ type: "PAUSE" });
    setModal(m);
  }
  function close() {
    if (modal === "resume") {
      setModal(null);
      navigate("/");
      return;
    }
    setModal(null);
    if (route === "/play") dispatch({ type: "RESUME" });
    setTutorialStart(false);
  }
  function begin(mode: Mode, skipTutorial = false) {
    const existing = mode === "daily" ? records.daily[utcDate()] : null;
    if (existing) {
      dispatch({
        type: "RESTORE",
        run: { ...existing, paused: existing.phase !== "results" },
      });
      navigate(existing.phase === "results" ? "/results" : "/play");
      if (existing.phase !== "results") setModal("resume");
      return;
    }
    if (mode === "daily" && !records.tutorialDone && !skipTutorial) {
      setTutorialStart(true);
      open("tutorial");
      return;
    }
    const next = makeRun(mode, utcDate(), undefined, records.recent);
    setUnlocks([]);
    dispatch({ type: "START_SHIFT", run: next });
    setModal(null);
    if (mode !== "daily")
      setRecords((prev) => ({
        ...prev,
        recent: Object.fromEntries(
          next.letters.map((l) => [
            letterById[l.puzzleId].category,
            l.puzzleId,
          ]),
        ),
      }));
    navigate("/play");
  }
  async function preferences(p: Preferences) {
    if (
      (p.sound && !records.preferences.sound) ||
      (p.atmosphere && !records.preferences.atmosphere)
    ) {
      const ready = await activate();
      setAudioFailed(!ready);
    }
    atmosphere(p.atmosphere);
    setRecords((prev) => ({ ...prev, preferences: p }));
  }
  function tutorialDone() {
    setRecords((prev) => ({ ...prev, tutorialDone: true }));
    setModal(null);
    if (tutorialStart || route === "/") begin("daily", true);
    else if (route === "/play") dispatch({ type: "RESUME" });
    setTutorialStart(false);
  }
  function reset() {
    const cleared = clearRecords();
    atmosphere(false);
    setRecords(freshRecords());
    dispatch({ type: "RESET" });
    runRef.current = null;
    snapshot.current = freshRecords();
    setModal(null);
    setConfirm(false);
    navigate("/");
    setStorageWarning(!cleared);
    notify(
      cleared
        ? "Local records cleared."
        : "Progress can’t be saved in this browser.",
    );
  }
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <Tooltip.Provider delayDuration={350}>
        <div className={`app ${route === "/" ? "at-home" : ""}`}>
          <a
            className="skip-link"
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector<HTMLElement>("main h1,main button")
                ?.focus();
            }}
          >
            Skip to content
          </a>
          <header className="utility-header">
            <a
              href="#/"
              className="wordmark"
              aria-label="Dead Letter — post office"
            >
              <PostalCrest />
              <span>DEAD LETTER</span>
            </a>
            <nav aria-label="Post office utilities">
              <IconButton label="Collection" onClick={() => open("collection")}>
                <UtilityIcon kind="collection" />
              </IconButton>
              <IconButton
                label={
                  records.preferences.sound
                    ? "Mute sound effects"
                    : "Enable sound effects"
                }
                pressed={records.preferences.sound}
                onClick={() =>
                  void preferences({
                    ...records.preferences,
                    sound: !records.preferences.sound,
                    atmosphere: records.preferences.sound
                      ? false
                      : records.preferences.atmosphere,
                  })
                }
              >
                <UtilityIcon
                  kind={records.preferences.sound ? "sound" : "muted"}
                />
              </IconButton>
              <IconButton label="Settings" onClick={() => open("settings")}>
                <UtilityIcon kind="settings" />
              </IconButton>
            </nav>
          </header>
          <PostalScene home={route === "/"} />
          <div id="main-content" className="screen-content">
            {route === "/" ? (
              <HomeScreen
                records={records}
                onResume={(saved) => {
                  dispatch({
                    type: "RESTORE",
                    run: { ...saved, paused: true },
                  });
                  setModal("resume");
                  navigate("/play");
                }}
                onStart={(m) => begin(m)}
                onTutorial={() => {
                  setTutorialStart(false);
                  open("tutorial");
                }}
                onAbout={() => open("about")}
              />
            ) : route === "/play" && run ? (
              <PlayScreen
                run={run}
                dispatch={dispatch}
                reduced={reduced}
                onPause={() => open("resume")}
              />
            ) : run?.phase === "results" ? (
              <ResultsScreen
                run={run}
                unlocks={unlocks}
                onReview={() => open("review")}
                onPractice={() => begin("practice")}
                onHome={() => navigate("/")}
                onDaily={() => begin("daily")}
                notify={notify}
              />
            ) : null}
          </div>
          <Suspense fallback={null}>
            <Overlays
              key={modal}
              modal={modal}
              records={records}
              run={run}
              onClose={close}
              onPreferences={(p) => void preferences(p)}
              onReset={() => setConfirm(true)}
              onResume={() => {
                dispatch({ type: "RESUME" });
                setModal(null);
              }}
              onTutorialDone={tutorialDone}
              audioFailed={audioFailed}
            />
          </Suspense>
          {confirm && (
            <ConfirmDialog
              onCancel={() => setConfirm(false)}
              onConfirm={reset}
            />
          )}
          <div className="status-toast" role="status" aria-live="polite">
            {storageWarning
              ? "Progress can’t be saved in this browser."
              : toast}
          </div>
        </div>
      </Tooltip.Provider>
    </MotionConfig>
  );
}

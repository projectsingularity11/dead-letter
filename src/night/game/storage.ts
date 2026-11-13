import type { Run, Save } from "./types";
import { mysteryById } from "../content/mysteries";
import { duration, solved, clueCount } from "./rules";
import { answerKey, matchesAnswer, validSubmission } from "./answers";
export const KEY = "dead-letter:night-walk:v4";
export const emptySave = (): Save => ({
  version: 4,
  active: null,
  daily: {},
  practice: null,
  best: 0,
  tutorialComplete: false,
  preferences: { sound: false, motion: "system" },
});
export function validRun(value: unknown): value is Run {
  try {
    const r = value as Run,
      m = mysteryById[r.mysteryId];
    if (
      !m ||
      (r.mode === "tutorial") !== (m.id === "tutorial") ||
      (r.mode === "daily" && (m.date !== r.date || m.number === 0)) ||
      typeof r.id !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
      !["daily", "practice", "tutorial"].includes(r.mode) ||
      ![
        "intro",
        "walking",
        "answering",
        "banished",
        "caught",
        "escaped",
      ].includes(r.phase) ||
      !Number.isInteger(r.clue) ||
      r.clue < 0 ||
      r.clue >= m.clues.length ||
      !Number.isFinite(r.remaining) ||
      r.remaining < 0 ||
      r.remaining > duration(r) ||
      typeof r.paused !== "boolean" ||
      !Array.isArray(r.misses) ||
      !Array.isArray(r.answers)
    )
      return false;
    if (
      !r.answers.every((a) => {
        const c = m.clues.find((c) => c.id === a.clueId);
        return (
          c &&
          Array.isArray(a.values) &&
          validSubmission(c, a.values) &&
          a.correct === matchesAnswer(c, a.values) &&
          Number.isFinite(a.remaining) &&
          a.remaining > 0 &&
          a.remaining <= c.seconds * 1000
        );
      })
    )
      return false;
    const wins = r.answers.filter((a) => a.correct);
    if (
      new Set(wins.map((a) => a.clueId)).size !== wins.length ||
      wins.some((a, i) => a.clueId !== m.clues[i].id)
    )
      return false;
    if (
      wins.length !==
        r.clue + (["banished", "escaped"].includes(r.phase) ? 1 : 0) ||
      (r.phase === "escaped" && wins.length !== clueCount(r))
    )
      return false;
    if (
      (r.phase === "caught" && r.remaining !== 0) ||
      (["intro", "answering", "walking", "banished", "escaped"].includes(
        r.phase,
      ) &&
        r.remaining <= 0)
    )
      return false;
    if (
      r.score !==
      (r.mode === "tutorial"
        ? 0
        : wins.reduce((n, _, i) => n + (i + 1) * 100, 0))
    )
      return false;
    const current = r.answers
      .filter((a) => a.clueId === m.clues[r.clue].id && !a.correct)
      .map((a) => answerKey(m.clues[r.clue], a.values));
    return (
      new Set(current).size === current.length &&
      new Set(r.misses).size === r.misses.length &&
      r.misses.every((id) => current.includes(id)) &&
      r.misses.length === current.length &&
      solved(r) <= clueCount(r)
    );
  } catch {
    return false;
  }
}
export function readSave(storage?: Pick<Storage, "getItem">) {
  const save = emptySave();
  try {
    const raw = (storage ?? window.localStorage).getItem(KEY);
    if (!raw) {
      const legacy = (storage ?? window.localStorage).getItem(
        "dead-letter:night-walk:v3",
      );
      if (legacy) {
        try {
          const old = JSON.parse(legacy);
          if (old?.preferences)
            save.preferences = {
              sound: old.preferences.sound === true,
              motion: ["system", "reduced", "full"].includes(
                old.preferences.motion,
              )
                ? old.preferences.motion
                : "system",
            };
        } catch {
          /* A corrupt legacy run cannot prevent a new case. */
        }
      }
      return { save, message: "" };
    }
    const v = JSON.parse(raw) as Save;
    if (!v || v.version !== 4 || !v.daily || typeof v.daily !== "object")
      throw Error("invalid");
    save.tutorialComplete = v.tutorialComplete === true;
    let damaged = false;
    const restore = (r: Run) => ({
      ...r,
      paused: !["caught", "escaped"].includes(r.phase),
    });
    for (const [date, r] of Object.entries(v.daily)) {
      if (validRun(r) && r.date === date && r.mode === "daily")
        save.daily[date] = restore(r);
      else damaged = true;
    }
    if (v.practice) {
      if (validRun(v.practice) && v.practice.mode === "practice")
        save.practice = restore(v.practice);
      else damaged = true;
    }
    if (v.active) {
      if (validRun(v.active)) save.active = restore(v.active);
      else damaged = true;
    }
    if (v.preferences)
      save.preferences = {
        sound: v.preferences.sound === true,
        motion: ["system", "reduced", "full"].includes(v.preferences.motion)
          ? v.preferences.motion
          : "system",
      };
    save.best = Math.max(
      0,
      ...Object.values(save.daily).map((r) => r.score),
      save.practice?.score ?? 0,
      typeof v.best === "number" && Number.isFinite(v.best)
        ? Math.min(3600, v.best)
        : 0,
    );
    return {
      save,
      message: damaged
        ? "A damaged run could not be restored. Your other records are safe."
        : "",
    };
  } catch (e) {
    return {
      save,
      message:
        e instanceof DOMException
          ? "Progress cannot be saved in this browser."
          : "A damaged save could not be restored.",
    };
  }
}
export function writeSave(value: Save, storage?: Pick<Storage, "setItem">) {
  try {
    (storage ?? window.localStorage).setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function clearSave(storage?: Pick<Storage, "removeItem">) {
  try {
    (storage ?? window.localStorage).removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

import type { Records, Run } from "./types";
import { letterById } from "../content/letters";
import { points } from "./scoring";
export const KEY = "dead-letter:records";
export const freshRecords = (): Records => ({
  version: 1,
  daily: {},
  practice: null,
  completedDates: [],
  collection: [],
  preferences: { sound: false, atmosphere: false, motion: "system" },
  tutorialDone: false,
  recent: {},
});
const phases = [
  "opening",
  "answering",
  "stamping",
  "reveal",
  "transitioning",
  "results",
];
export function validRun(r: unknown): r is Run {
  try {
    if (!r || typeof r !== "object") return false;
    const x = r as Run;
    if (
      typeof x.id !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(x.date) ||
      !["daily", "practice", "relaxed"].includes(x.mode) ||
      !phases.includes(x.phase) ||
      !Number.isInteger(x.round) ||
      x.round < 0 ||
      x.round > 5 ||
      !Array.isArray(x.letters) ||
      x.letters.length !== 6 ||
      !Array.isArray(x.answers) ||
      !Number.isFinite(x.remaining) ||
      x.remaining < 0 ||
      x.remaining > 25000 ||
      typeof x.paused !== "boolean" ||
      typeof x.armed !== "boolean"
    )
      return false;
    if (
      new Set(x.letters.map((l) => l.puzzleId)).size !== 6 ||
      new Set(x.letters.map((l) => letterById[l.puzzleId]?.category)).size !== 6
    )
      return false;
    if (
      !x.letters.every((l) => {
        const p = letterById[l.puzzleId];
        return (
          p &&
          Array.isArray(l.claimIds) &&
          l.claimIds.length === 4 &&
          new Set(l.claimIds).size === 4 &&
          l.claimIds.every((id) => p.claims.some((c) => c.id === id))
        );
      })
    )
      return false;
    const resolved = [
      "stamping",
      "reveal",
      "transitioning",
      "results",
    ].includes(x.phase);
    if (
      x.answers.length !== x.round + (resolved ? 1 : 0) ||
      (x.phase === "results" && x.answers.length !== 6)
    )
      return false;
    if (
      x.selected !== null &&
      !x.letters[x.round].claimIds.includes(x.selected)
    )
      return false;
    if (
      !x.answers.every((a, i) => {
        const p = letterById[x.letters[i].puzzleId];
        return (
          a.puzzleId === p.id &&
          (a.choice === null || p.claims.some((c) => c.id === a.choice)) &&
          typeof a.sealed === "boolean" &&
          typeof a.timeout === "boolean" &&
          a.correct === (a.choice === p.falseClaimId) &&
          a.points === points(a.correct, a.sealed, a.timeout) &&
          (!a.timeout || (a.choice === null && !a.sealed))
        );
      })
    )
      return false;
    return (
      x.score === x.answers.reduce((n, a) => n + a.points, 0) &&
      x.seals === 2 - x.answers.filter((a) => a.sealed).length &&
      x.seals >= 0
    );
  } catch {
    return false;
  }
}
export function normalizeRun(run: Run): Run {
  let r = { ...run, paused: true };
  if (r.phase === "stamping") r.phase = "reveal";
  if (r.phase === "transitioning")
    r = {
      ...r,
      round: r.round + 1,
      phase: "opening",
      selected: null,
      armed: false,
      remaining: 25000,
    };
  return r;
}
export function load(storage?: Pick<Storage, "getItem">): {
  records: Records;
  message: string;
} {
  const records = freshRecords();
  try {
    const raw = (storage ?? window.localStorage).getItem(KEY);
    if (!raw) return { records, message: "" };
    const v = JSON.parse(raw) as Records;
    if (
      !v ||
      typeof v !== "object" ||
      v.version !== 1 ||
      !v.daily ||
      !Array.isArray(v.collection) ||
      !Array.isArray(v.completedDates)
    )
      throw Error("schema");
    let corrupt = false;
    for (const [date, r] of Object.entries(v.daily)) {
      if (validRun(r) && r.mode === "daily" && r.date === date)
        records.daily[date] = normalizeRun(r);
      else corrupt = true;
    }
    if (v.practice) {
      if (validRun(v.practice) && v.practice.mode !== "daily")
        records.practice = normalizeRun(v.practice);
      else corrupt = true;
    }
    records.completedDates = v.completedDates.filter(
      (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
    );
    records.collection = v.collection.filter((s) => typeof s === "string");
    records.tutorialDone = v.tutorialDone === true;
    records.activeId = typeof v.activeId === "string" ? v.activeId : undefined;
    if (v.preferences)
      records.preferences = {
        sound: v.preferences.sound === true,
        atmosphere: v.preferences.atmosphere === true,
        motion: ["system", "reduced", "full"].includes(v.preferences.motion)
          ? v.preferences.motion
          : "system",
      };
    if (v.recent && typeof v.recent === "object")
      records.recent = Object.fromEntries(
        Object.entries(v.recent).filter(
          ([, id]) => typeof id === "string" && !!letterById[id],
        ),
      );
    return {
      records,
      message: corrupt
        ? "A saved shift could not be restored. Your other records are still here."
        : "",
    };
  } catch (e) {
    return {
      records,
      message:
        e instanceof SyntaxError
          ? "A saved shift could not be restored. Your other records are still here."
          : e instanceof Error && e.message === "schema"
            ? "A saved shift could not be restored. Your other records are still here."
            : "Progress can’t be saved in this browser.",
    };
  }
}
export function save(records: Records, storage?: Pick<Storage, "setItem">) {
  try {
    (storage ?? window.localStorage).setItem(KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
export function clearRecords(provided?: Storage) {
  try {
    const storage = provided ?? window.localStorage;
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (key?.startsWith("dead-letter:")) storage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}

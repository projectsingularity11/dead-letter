import type { Run } from "./types";
import { letterById } from "../content/letters";
import { points } from "./scoring";
export type Event =
  | { type: "RESET" }
  | { type: "START_SHIFT"; run: Run }
  | { type: "RESTORE"; run: Run }
  | {
      type:
        | "OPENING_COMPLETE"
        | "TOGGLE_SEAL"
        | "SUBMIT"
        | "TIMEOUT"
        | "STAMP_COMPLETE"
        | "NEXT"
        | "TRANSITION_COMPLETE"
        | "PAUSE"
        | "RESUME"
        | "COMPLETE_SHIFT";
    }
  | { type: "SELECT_CLAIM"; id: string }
  | { type: "TICK"; elapsed: number };
export function reducer(state: Run | null, event: Event): Run | null {
  if (event.type === "RESET") return null;
  if (event.type === "START_SHIFT" || event.type === "RESTORE")
    return event.run;
  if (!state) return state;
  const s = state;
  switch (event.type) {
    case "OPENING_COMPLETE":
      return s.phase === "opening" ? { ...s, phase: "answering" } : s;
    case "SELECT_CLAIM":
      return s.phase === "answering" &&
        !s.paused &&
        s.letters[s.round].claimIds.includes(event.id)
        ? { ...s, selected: event.id }
        : s;
    case "TOGGLE_SEAL":
      return s.phase === "answering" && !s.paused && s.seals > 0
        ? { ...s, armed: !s.armed }
        : s;
    case "TICK":
      return s.phase === "answering" && !s.paused && s.mode !== "relaxed"
        ? {
            ...s,
            remaining: Math.max(0, s.remaining - Math.max(0, event.elapsed)),
          }
        : s;
    case "SUBMIT":
    case "TIMEOUT": {
      if (s.phase !== "answering" || s.paused || s.answers.length !== s.round)
        return s;
      const timeout =
        event.type === "TIMEOUT" || (s.mode !== "relaxed" && s.remaining <= 0);
      if (!timeout && !s.selected) return s;
      if (timeout && (s.mode === "relaxed" || s.remaining > 0)) return s;
      const puzzle = letterById[s.letters[s.round].puzzleId];
      const sealed = !timeout && s.armed && s.seals > 0;
      const choice = timeout ? null : s.selected;
      const correct = choice === puzzle.falseClaimId;
      const earned = points(correct, sealed, timeout);
      return {
        ...s,
        phase: timeout ? "reveal" : "stamping",
        selected: choice,
        armed: false,
        seals: s.seals - (sealed ? 1 : 0),
        score: s.score + earned,
        answers: [
          ...s.answers,
          {
            puzzleId: puzzle.id,
            choice,
            correct,
            sealed,
            points: earned,
            timeout,
          },
        ],
      };
    }
    case "STAMP_COMPLETE":
      return s.phase === "stamping" ? { ...s, phase: "reveal" } : s;
    case "NEXT":
      return s.phase === "reveal"
        ? { ...s, phase: s.round === 5 ? "results" : "transitioning" }
        : s;
    case "TRANSITION_COMPLETE":
      return s.phase === "transitioning"
        ? {
            ...s,
            round: s.round + 1,
            phase: "opening",
            selected: null,
            armed: false,
            remaining: 25000,
          }
        : s;
    case "COMPLETE_SHIFT":
      return s.answers.length === 6 && s.phase === "reveal"
        ? { ...s, phase: "results" }
        : s;
    case "PAUSE":
      return { ...s, paused: true };
    case "RESUME":
      return { ...s, paused: false };
  }
}

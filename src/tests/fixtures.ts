import { makeRun } from "../game/daily";
import { reducer } from "../game/reducer";
import type { Run } from "../game/types";
import type { Event } from "../game/reducer";
import { letterById } from "../content/letters";
const step = (r: Run, e: Event) => reducer(r, e)!;
function answer(run: Run, correct = true, sealed = false) {
  let r = step(run, { type: "OPENING_COMPLETE" });
  r = step(r, {
    type: "SELECT_CLAIM",
    id: correct
      ? letterById[r.letters[r.round].puzzleId].falseClaimId
      : letterById[r.letters[r.round].puzzleId].claims.find(
          (c) => c.id !== letterById[r.letters[r.round].puzzleId].falseClaimId,
        )!.id,
  });
  if (sealed) r = step(r, { type: "TOGGLE_SEAL" });
  return step(r, { type: "SUBMIT" });
}
export function complete(
  mode: "daily" | "practice" | "relaxed" = "daily",
  date = "2026-11-11",
  correct = true,
) {
  let r = makeRun(mode, date, "fixture");
  for (let i = 0; i < 6; i++) {
    r = answer(r, correct, i < 2);
    r = step(r, { type: "STAMP_COMPLETE" });
    r = step(r, { type: "NEXT" });
    if (i < 5) r = step(r, { type: "TRANSITION_COMPLETE" });
  }
  return r;
}

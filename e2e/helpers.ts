import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { freshRecords, KEY } from "../src/game/persistence";
import { makeRun } from "../src/game/daily";
import { letterById } from "../src/content/letters";
import type { Mode, Run } from "../src/game/types";
import { reducer } from "../src/game/reducer";
export function fixture(mode: Mode = "practice") {
  return makeRun(mode, new Date().toISOString().slice(0, 10), "visual-fixture");
}
export function resolved(run: Run, correct = true) {
  let r: Run = { ...run, phase: "answering" };
  const p = letterById[r.letters[r.round].puzzleId];
  r = reducer(r, {
    type: "SELECT_CLAIM",
    id: correct
      ? p.falseClaimId
      : p.claims.find((c) => c.id !== p.falseClaimId)!.id,
  })!;
  r = reducer(r, { type: "SUBMIT" })!;
  return reducer(r, { type: "STAMP_COMPLETE" })!;
}
export function finished(mode: Mode = "practice") {
  let r = fixture(mode);
  for (let i = 0; i < 6; i++) {
    r = resolved(r, i !== 2);
    r = reducer(r, { type: "NEXT" })!;
    if (i < 5) r = reducer(r, { type: "TRANSITION_COMPLETE" })!;
  }
  return r;
}
export async function seed(page: Page, run?: Run) {
  const records = freshRecords();
  records.tutorialDone = true;
  records.preferences.motion = "reduced";
  if (run) {
    records.activeId = run.id;
    if (run.mode === "daily") records.daily[run.date] = run;
    else records.practice = run;
  }
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    { key: KEY, value: JSON.stringify(records) },
  );
}
export async function begin(page: Page, mode: Mode = "practice") {
  await seed(page);
  await page.goto("/");
  await page
    .getByRole("button", {
      name:
        mode === "daily"
          ? "Begin tonight’s shift"
          : mode === "relaxed"
            ? "Relaxed practice"
            : "Practice shift",
      exact: true,
    })
    .click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
}
export async function playSix(page: Page, keyboard = false) {
  for (let i = 0; i < 6; i++) {
    await expect(page.getByRole("radio").first()).toBeEnabled();
    if (keyboard) {
      await page.keyboard.press("1");
      if (i < 2) await page.keyboard.press("s");
      await page.keyboard.press("Enter");
    } else {
      await page.getByRole("radio").first().click();
      if (i < 2)
        await page.getByRole("button", { name: /Use a wax seal/ }).click();
      await page.getByRole("button", { name: /RETURN TO SENDER/ }).click();
    }
    const next = page.getByRole("button", {
      name: i === 5 ? "Close the post office" : "Next letter",
      exact: true,
    });
    await expect(next).toBeEnabled();
    if (keyboard) await page.keyboard.press("Enter");
    else await next.click();
  }
  await expect(
    page.getByRole("button", { name: /Copy shift receipt/ }),
  ).toBeVisible();
}

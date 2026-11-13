import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Run } from "../src/night/game/types";
import { makeRun, reducer, commit, clueCount } from "../src/night/game/rules";
import { emptySave, KEY } from "../src/night/game/storage";
import { mysteries, mysteryById } from "../src/night/content/mysteries";
export const fixture = (id = mysteries[0].id) =>
  reducer(makeRun("practice", "2026-11-13", id, "fixture-night-walk"), {
    type: "BEGIN",
  })!;
export function finished(caught = false) {
  let r = fixture();
  if (caught)
    return reducer(reducer(r, { type: "ARRIVE" })!, {
      type: "TICK",
      elapsed: 999999,
    })!;
  for (let i = 0; i < 8; i++) {
    r = reducer(r, { type: "ARRIVE" })!;
    r = reducer(r, {
      type: "ANSWER",
      values: mysteryById[r.mysteryId].clues[i].fields.map((f) => f.answer),
    })!;
    r = reducer(r, { type: "NEXT" })!;
  }
  return r;
}
export async function seed(page: Page, run?: Run) {
  const s = run ? commit(emptySave(), run) : emptySave();
  s.preferences.motion = "reduced";
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    { key: KEY, value: JSON.stringify(s) },
  );
}
export async function begin(page: Page, daily = true) {
  await seed(page);
  await page.goto("/");
  await page
    .getByRole("button", {
      name: daily ? "START GAME" : "Play another mystery",
      exact: daily,
    })
    .click();
  await page
    .getByRole("button", { name: "PICK UP THE PAGE", exact: true })
    .click();
  await expect(page.locator(".submit-answer")).toBeEnabled();
}
export async function runState(page: Page): Promise<Run> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).active,
    KEY,
  );
}
export async function enter(page: Page, values: string[]) {
  for (let i = 0; i < values.length; i++)
    await page.locator(".answer-input").nth(i).fill(values[i]);
}
export async function solve(page: Page, keyboard = false) {
  const r = await runState(page),
    clue = mysteryById[r.mysteryId].clues[r.clue];
  await enter(
    page,
    clue.fields.map((f) => f.answer),
  );
  if (keyboard) await page.locator(".answer-input").last().press("Enter");
  else await page.locator(".submit-answer").click();
  await expect(
    page.getByRole("heading", { name: "You bought another block." }),
  ).toBeVisible();
}
export async function complete(page: Page, keyboard = false) {
  const total = clueCount(await runState(page));
  for (let i = 0; i < total; i++) {
    await expect(page.locator(".submit-answer")).toBeEnabled();
    await solve(page, keyboard);
    await page
      .getByRole("button", {
        name: i === total - 1 ? "GET PETE HOME" : "NEXT BLOCK",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", {
      name: total === 2 ? "YOU KNOW THE WAY." : "PETE MADE IT HOME.",
    }),
  ).toBeVisible();
}
export function longestRun() {
  let selected = { m: 0, i: 0, length: 0 };
  mysteries.forEach((m, mi) =>
    m.clues.forEach((c, i) => {
      const length = c.evidence.length + c.question.length;
      if (length > selected.length) selected = { m: mi, i, length };
    }),
  );
  const m = mysteries[selected.m];
  let r = fixture(m.id);
  for (let i = 0; i < selected.i; i++) {
    r = reducer(r, { type: "ARRIVE" })!;
    r = reducer(r, {
      type: "ANSWER",
      values: m.clues[i].fields.map((f) => f.answer),
    })!;
    r = reducer(r, { type: "NEXT" })!;
  }
  return reducer(r, { type: "ARRIVE" })!;
}

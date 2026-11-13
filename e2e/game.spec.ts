import { test, expect } from "@playwright/test";
import {
  begin,
  complete,
  solve,
  runState,
  seed,
  fixture,
  finished,
} from "./helpers";
import { mysteryById } from "../src/night/content/mysteries";
test("Daily start, eight connected clues, escape and saved result", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await begin(page);
  const r = await runState(page);
  await expect(
    page.getByRole("heading", {
      name: mysteryById[r.mysteryId].clues[0].title,
    }),
  ).toBeVisible();
  await complete(page);
  await expect(page.getByText("3600", { exact: true }).first()).toBeVisible();
  await page
    .getByRole("button", { name: "Back to street", exact: true })
    .click();
  await page.getByRole("button", { name: "VIEW TODAY’S RUN" }).click();
  await expect(
    page.getByRole("heading", { name: "PETE MADE IT HOME." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("practice is keyboard playable and does not complete Daily", async ({
  page,
}) => {
  await begin(page, false);
  await complete(page, true);
  await page
    .getByRole("button", { name: "Back to street", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "START GAME", exact: true }),
  ).toBeVisible();
});
test("wrong answers move the ghost closer and three unique mistakes kill Pete", async ({
  page,
}) => {
  await begin(page);
  const r = await runState(page),
    c = mysteryById[r.mysteryId].clues[0];
  for (const id of r.choiceOrder[0].filter((id) => id !== c.answerId)) {
    const i = r.choiceOrder[0].indexOf(id);
    await page.locator(".answer-option").nth(i).click();
    if (i !== -1 && (await page.locator(".answer-option").count()))
      await expect(page.locator(".answer-option").nth(i)).toBeDisabled();
  }
  await expect(
    page.getByRole("heading", { name: "THE GHOST GOT PETE." }),
  ).toBeVisible();
  const ended = await runState(page);
  expect(ended.score).toBe(0);
  expect(ended.remaining).toBe(0);
});
test("the ghost catches Pete when active time runs out", async ({ page }) => {
  await begin(page);
  await page.clock.install();
  const r = await runState(page);
  await page.clock.runFor(r.remaining + 300);
  await expect(
    page.getByRole("heading", { name: "THE GHOST GOT PETE." }),
  ).toBeVisible();
});
test("solved earlier pages can be consulted without spending chase time", async ({
  page,
}) => {
  await begin(page);
  await solve(page);
  await page.getByRole("button", { name: "NEXT BLOCK", exact: true }).click();
  await expect(page.locator(".answer-option").first()).toBeEnabled();
  await page
    .getByRole("button", { name: "Earlier pages", exact: false })
    .click();
  await expect(page.getByRole("dialog", { name: "CASE FILES" })).toBeVisible();
  await expect(page.locator(".case-list details")).toHaveCount(1);
  await page.locator(".case-list summary").click();
  await expect(page.getByText("Answer:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Earlier pages", exact: false }),
  ).toBeFocused();
});
test("result copy uses clipboard and fallback remains selectable", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await seed(page, finished());
  await page.goto("/#/results");
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Run copied.");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(Error()) },
    }),
  );
  await page.getByRole("button", { name: "Copy result", exact: true }).click();
  await expect(page.getByRole("textbox")).toContainText("3600");
});
test("held/repeated keys do not answer another question", async ({ page }) => {
  await begin(page);
  const r = await runState(page),
    c = mysteryById[r.mysteryId].clues[0],
    key = String(r.choiceOrder[0].indexOf(c.answerId) + 1);
  await page.keyboard.down(key);
  await page.keyboard.down(key);
  await page.keyboard.up(key);
  await expect(
    page.getByRole("heading", { name: "You bought another block." }),
  ).toBeVisible();
  expect((await runState(page)).answers).toHaveLength(1);
});

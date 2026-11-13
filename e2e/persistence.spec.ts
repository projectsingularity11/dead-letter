import { test, expect } from "@playwright/test";
import { begin, runState, solve, seed, fixture, enter } from "./helpers";
import { KEY } from "../src/night/game/storage";
test("reload requires Resume and keeps wrong choices, distance and score", async ({
  page,
}) => {
  await begin(page);
  const r = await runState(page);
  await enter(page, ["9999", "WRONG"]);
  await page.locator(".submit-answer").click();
  await page.waitForTimeout(150);
  const before = await runState(page);
  await page.reload();
  await expect(
    page.getByRole("dialog", { name: "TAKE A BREATH." }),
  ).toBeVisible();
  const paused = await runState(page);
  await page.waitForTimeout(1100);
  expect((await runState(page)).remaining).toBe(paused.remaining);
  expect(paused.answers).toEqual(before.answers);
  expect(paused.score).toBe(before.score);
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  expect((await runState(page)).paused).toBe(false);
});
test("settings and explicit pause stop active elapsed time", async ({
  page,
}) => {
  await begin(page);
  await page.clock.install();
  await page.clock.runFor(1000);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const time = (await runState(page)).remaining;
  await page.clock.runFor(20000);
  expect((await runState(page)).remaining).toBe(time);
  const label = await page
    .getByRole("timer", { includeHidden: true })
    .getAttribute("aria-label");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.clock.runFor(2200);
  await expect(page.getByRole("timer")).not.toHaveAttribute(
    "aria-label",
    label!,
  );
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  const again = (await runState(page)).remaining;
  await page.clock.runFor(20000);
  expect((await runState(page)).remaining).toBe(again);
});
test("a hidden tab opens Resume instead of continuing to chase", async ({
  page,
}) => {
  await begin(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("dialog", { name: "TAKE A BREATH." }),
  ).toBeVisible();
  const time = (await runState(page)).remaining;
  await page.waitForTimeout(1200);
  expect((await runState(page)).remaining).toBe(time);
});
test("answer is durable before the banish animation completes", async ({
  page,
}) => {
  await begin(page);
  await solve(page);
  const saved = await runState(page);
  expect(saved.phase).toBe("banished");
  expect(saved.answers.filter((a) => a.correct)).toHaveLength(1);
  expect(saved.score).toBe(100);
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "NEXT BLOCK", exact: true }),
  ).toBeEnabled();
  expect((await runState(page)).answers).toEqual(saved.answers);
});
test("denied storage getter remains playable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "START GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "PICK UP THE PAGE", exact: true })
    .click();
  await expect(page.locator(".submit-answer").first()).toBeEnabled();
  await expect(page.locator(".night-toast")).toContainText("cannot be saved");
  expect(errors).toEqual([]);
});
test("reset cancels by default and preserves legacy/unrelated records", async ({
  page,
}) => {
  await begin(page);
  await page.evaluate(() => {
    localStorage.setItem("other", "keep");
    localStorage.setItem("dead-letter:records", "legacy");
  });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset local runs" }).click();
  await expect(page.getByRole("button", { name: "KEEP RUNS" })).toBeFocused();
  await page.getByRole("button", { name: "Erase runs" }).click();
  await expect(
    page.getByRole("button", { name: "START GAME", exact: true }),
  ).toBeVisible();
  const values = await page.evaluate(
    (key) => ({
      other: localStorage.getItem("other"),
      legacy: localStorage.getItem("dead-letter:records"),
      state: JSON.parse(localStorage.getItem(key)!),
    }),
    KEY,
  );
  expect(values.other).toBe("keep");
  expect(values.legacy).toBe("legacy");
  expect(values.state.active).toBeNull();
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seed, runState, complete, begin, enter } from "./helpers";
import { dailyMystery } from "../src/night/content/mysteries";
import { KEY } from "../src/night/game/storage";
test("guided tutorial teaches typing and chasing without using Daily or best score", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "FIRST NIGHT? PLAY THE TUTORIAL",
      exact: true,
    })
    .click();
  await expect(page.locator(".submit-answer")).toBeEnabled();
  await page.clock.install();
  const before = (await runState(page)).remaining;
  await page.clock.runFor(120000);
  expect((await runState(page)).remaining).toBe(before);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await enter(page, ["9999", "WRONG"]);
  await page.locator(".submit-answer").click();
  await expect(
    page.getByText("That doesn’t match the note.", { exact: false }),
  ).toBeVisible();
  expect((await runState(page)).remaining).toBe(before);
  expect((await runState(page)).phase).toBe("answering");
  await complete(page, true);
  const save = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(save.daily).toEqual({});
  expect(save.best).toBe(0);
  expect(save.tutorialComplete).toBe(true);
  await page
    .getByRole("button", { name: "START DAILY MYSTERY", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "PICK UP THE PAGE", exact: true }),
  ).toBeVisible();
});
test("an open title screen changes to the next case at midnight UTC", async ({
  page,
}) => {
  await seed(page);
  await page.clock.install({ time: new Date("2026-11-13T23:59:58Z") });
  await page.goto("/");
  await expect(page.locator(".daily-description h2")).toHaveText(
    dailyMystery("2026-11-13")!.title,
  );
  await page.clock.runFor(2100);
  await expect(page.locator(".daily-description h2")).toHaveText(
    dailyMystery("2026-11-14")!.title,
  );
  await expect(page.locator(".reset-countdown")).toHaveText("24:00:00");
  await page.getByRole("button", { name: "START GAME", exact: true }).click();
  expect((await runState(page)).date).toBe("2026-11-14");
});
test("a run started yesterday remains recoverable after midnight", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-13T23:59:58Z") });
  await begin(page);
  const original = await runState(page);
  await page.clock.runFor(3000);
  expect((await runState(page)).date).toBe("2026-11-13");
  await page.locator(".answer-input").first().focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "TAKE A BREATH." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to street", exact: true })
    .click();
  await expect(page.locator(".daily-description h2")).toHaveText(
    dailyMystery("2026-11-14")!.title,
  );
  await page.getByRole("button", { name: "START GAME", exact: true }).click();
  const state = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(state.active.date).toBe("2026-11-14");
  expect(state.daily["2026-11-13"].id).toBe(original.id);
});
test("unreleased cases are locked and expired calendar offers practice honestly", async ({
  page,
}) => {
  await seed(page);
  await page.clock.install({ time: new Date("2026-11-13T12:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: /Case files/ }).click();
  await expect(
    page.getByRole("button", {
      name: `Practice ${dailyMystery("2026-11-14")!.title}`,
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.clock.setSystemTime(new Date("2027-02-21T00:00:00Z"));
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    page.getByRole("button", { name: "SEASON COMPLETE", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Play another mystery", exact: false })
    .click();
  await expect(
    page.getByRole("button", { name: "PICK UP THE PAGE", exact: true }),
  ).toBeVisible();
});

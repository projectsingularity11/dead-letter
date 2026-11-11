import { test, expect } from "@playwright/test";
import { begin, playSix, seed } from "./helpers";
import { KEY } from "../src/game/persistence";
test("complete practice, collect, review and share", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await begin(page);
  await playSix(page);
  await page.getByRole("button", { name: "Review letters" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("details")).toHaveCount(6);
  await page.locator("summary").first().click();
  await expect(
    page.getByText("The false statement", { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Review letters" }),
  ).toBeFocused();
  await page.getByRole("button", { name: /Copy shift receipt/ }).click();
  await expect(page.getByRole("status")).toContainText("Copied to clipboard");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(
    page
      .locator(".stamp-cell")
      .filter({
        has: page.getByRole("heading", { name: "First Class", exact: true }),
      })
      .getByText("Collected", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".stamp-cell")
      .filter({
        has: page.getByRole("heading", { name: "Worldly Spirit", exact: true }),
      })
      .getByText("Collected", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("relaxed practice completes with keyboard and awards Quiet Hours", async ({
  page,
}) => {
  await begin(page, "relaxed");
  await expect(page.getByRole("timer")).toHaveCount(0);
  await playSix(page, true);
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await expect(
    page
      .locator(".stamp-cell")
      .filter({
        has: page.getByRole("heading", { name: "Quiet Hours", exact: true }),
      })
      .getByText("Collected", { exact: true }),
  ).toBeVisible();
});
test("Daily completion persists and home opens tonight’s receipt", async ({
  page,
}) => {
  await begin(page, "daily");
  await playSix(page);
  await page.getByRole("button", { name: "Back to post office" }).click();
  await page.getByRole("button", { name: "View tonight’s receipt" }).click();
  await expect(page.getByText("SHIFT RECEIPT", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("SHIFT RECEIPT", { exact: true })).toBeVisible();
});
test("first Daily tutorial is unscored and can be completed", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin tonight’s shift" }).click();
  await expect(
    page.getByRole("heading", { name: "Find the letter’s lie" }),
  ).toBeVisible();
  await page.getByRole("radio").last().click();
  await expect(
    page.getByText("Exactly. That statement goes back to the sender."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Start my shift" }).click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
  await expect(page.getByText("2 remaining")).toBeVisible();
});
test("timeout does not submit selected claim or consume armed seal", async ({
  page,
}) => {
  await begin(page);
  await page.clock.install();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: /Use a wax seal/ }).click();
  await page.clock.runFor(25500);
  await expect(
    page.getByRole("heading", { name: "The collection bell rang" }),
  ).toBeVisible();
  await expect(
    page.getByText("No answer submitted. Your wax seal was not used."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next letter", exact: true }).click();
  await expect(page.getByText("2 remaining")).toBeVisible();
});
test("local reset defaults to cancel and clears only owned records", async ({
  page,
}) => {
  await begin(page);
  await page.evaluate(() => localStorage.setItem("unrelated-record", "keep"));
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset local records" }).click();
  await expect(
    page.getByRole("button", { name: "Keep records" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Clear local records", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Begin tonight’s shift" }),
  ).toBeVisible();
  const state = await page.evaluate(
    (key) => ({
      other: localStorage.getItem("unrelated-record"),
      records: JSON.parse(localStorage.getItem(key) || "{}"),
    }),
    KEY,
  );
  expect(state.other).toBe("keep");
  expect(state.records.daily).toEqual({});
  expect(state.records.practice).toBeNull();
});

test("claim arrows and Space work in the real browser", async ({ page }) => {
  await begin(page, "relaxed");
  await page.getByRole("radio").first().focus();
  await page.keyboard.down("ArrowDown");
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.keyboard.up("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
});

test("sound and atmosphere require an explicit gesture and persist preferences", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seed(page);
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Enable sound effects" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Sound effects", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("switch", { name: "Atmosphere", exact: true }),
  ).not.toBeChecked();
  await page
    .getByRole("switch", { name: "Sound effects", exact: true })
    .click();
  await page.getByRole("switch", { name: "Atmosphere", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Mute sound effects" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Sound effects", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("switch", { name: "Atmosphere", exact: true }),
  ).not.toBeChecked();
  expect(errors).toEqual([]);
});

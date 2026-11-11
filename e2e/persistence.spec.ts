import { test, expect } from "@playwright/test";
import { begin } from "./helpers";
test("restore incomplete Daily preserves choice, seal and timer until explicit resume", async ({
  page,
}) => {
  await begin(page, "daily");
  await page.getByRole("radio").nth(1).click();
  await page.getByRole("button", { name: /Use a wax seal/ }).click();
  await page.waitForTimeout(1200);
  const before = await page
    .getByRole("timer", { includeHidden: true })
    .getAttribute("aria-label");
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(
    page.getByRole("timer", { includeHidden: true }),
  ).toHaveAttribute("aria-label", before!);
  await page.getByRole("button", { name: "Resume shift", exact: true }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await expect(
    page.getByRole("button", { name: /Wax seal armed/ }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("settings, explicit pause and home navigation preserve active time", async ({
  page,
}) => {
  await begin(page);
  await page.clock.install();
  await page.clock.runFor(1000);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const paused = await page
    .getByRole("timer", { includeHidden: true })
    .getAttribute("aria-label");
  await page.clock.runFor(10000);
  await expect(
    page.getByRole("timer", { includeHidden: true }),
  ).toHaveAttribute("aria-label", paused!);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.clock.runFor(1000);
  expect(
    await page
      .getByRole("timer", { includeHidden: true })
      .getAttribute("aria-label"),
  ).not.toBe(paused);
  await page.getByRole("button", { name: "Pause shift", exact: true }).click();
  const explicit = await page
    .getByRole("timer", { includeHidden: true })
    .getAttribute("aria-label");
  await page.clock.runFor(10000);
  await expect(
    page.getByRole("timer", { includeHidden: true }),
  ).toHaveAttribute("aria-label", explicit!);
  await page.getByRole("button", { name: "Resume shift", exact: true }).click();
});
test("hidden-tab event opens Resume without losing active time", async ({
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
    page.getByRole("dialog", { name: "Your shift is waiting." }),
  ).toBeVisible();
  const seconds = await page
    .getByRole("timer", { includeHidden: true })
    .getAttribute("aria-label");
  await page.waitForTimeout(1200);
  await expect(
    page.getByRole("timer", { includeHidden: true }),
  ).toHaveAttribute("aria-label", seconds!);
  await page.evaluate(() =>
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    }),
  );
  await page.getByRole("button", { name: "Resume shift", exact: true }).click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
});

test("unfinished Practice is reachable from home after reload", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("radio").nth(2).click();
  await page.getByRole("link", { name: "Dead Letter — post office" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Resume Practice shift", exact: true })
    .click();
  await page.getByRole("button", { name: "Resume shift", exact: true }).click();
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
});
test("storage denial leaves the game playable with an honest warning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Relaxed practice", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
  await expect(page.getByRole("status")).toContainText(
    "Progress can’t be saved in this browser.",
  );
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: /RETURN TO SENDER/ }).click();
  await expect(
    page.getByRole("button", { name: "Next letter", exact: true }),
  ).toBeEnabled();
});

test("denied localStorage getter does not crash or prevent play", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Unavailable", "SecurityError");
      },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin tonight’s shift" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Relaxed practice", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
  await expect(page.getByRole("status")).toContainText(
    "Progress can’t be saved in this browser.",
  );
  expect(errors).toEqual([]);
});
test("submitted result is durable before stamp completion", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("radio", { name: "Full", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.clock.install({ time: new Date("2026-11-11T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-11T12:00:01Z"));
  await page.getByRole("radio").nth(1).click();
  await page.getByRole("button", { name: /RETURN TO SENDER/ }).click();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("dead-letter:records")!).practice,
  );
  expect(saved.phase).toBe("stamping");
  await expect(page.getByRole('radio',{checked:true}).locator('.active-stamp')).toBeVisible();
  expect(saved.answers).toHaveLength(1);
  await page.clock.resume();
  await page.reload();
  await page.getByRole("button", { name: "Resume shift", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next letter", exact: true }),
  ).toBeEnabled();
  const restored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("dead-letter:records")!).practice,
  );
  expect(restored.answers).toEqual(saved.answers);
  expect(restored.score).toBe(saved.score);
});

test("starting Daily preserves the previous Practice selections", async ({
  page,
}) => {
  await begin(page);
  const recent = await page.evaluate(
    () => JSON.parse(localStorage.getItem("dead-letter:records")!).recent,
  );
  await page.getByRole("link", { name: "Dead Letter — post office" }).click();
  await page.getByRole("button", { name: "Begin tonight’s shift" }).click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("dead-letter:records")!).recent,
    ),
  ).toEqual(recent);
});

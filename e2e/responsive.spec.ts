import { test, expect } from "@playwright/test";
import { begin, seed, finished } from "./helpers";
for (const [width, height] of [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
  [360, 800],
  [844, 390],
])
  test(`street and clues fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await begin(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const answer = page.locator(".answer-option").last();
    await answer.scrollIntoViewIfNeeded();
    await expect(answer).toBeInViewport();
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page
      .getByRole("button", { name: "Reset local runs" })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "Reset local runs" }),
    ).toBeInViewport();
  });
test("200 percent reflow keeps answers reachable without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await begin(page);
  await page.addStyleTag({ content: "body{zoom:2}" });
  await page.locator(".answer-option").last().scrollIntoViewIfNeeded();
  await expect(page.locator(".answer-option").last()).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const [width, height] of [
  [390, 844],
  [844, 390],
])
  test(`long clues retain a visible chase bar at ${width}x${height}`, async ({
    page,
  }) => {
    const { longestRun } = await import("./helpers");
    await page.setViewportSize({ width, height });
    await seed(page, longestRun());
    await page.goto("/#/play");
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await page.locator(".answer-option").last().scrollIntoViewIfNeeded();
    await expect(page.locator(".answer-option").last()).toBeInViewport();
    await expect(page.locator(".mobile-threat")).toBeInViewport();
    const bar = await page.locator(".mobile-threat").boundingBox(),
      answer = await page.locator(".answer-option").last().boundingBox();
    expect(bar!.height).toBeLessThanOrEqual(48);
    expect(answer!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height);
  });

test("the city paints on first load and a paused scene avoids repeated painting", async ({
  page,
}) => {
  await seed(page);
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.drawImage;
    let count = 0;
    Object.defineProperty(window, "__scenePaints", { get: () => count });
    Object.defineProperty(CanvasRenderingContext2D.prototype, "drawImage", {
      configurable: true,
      writable: true,
      value: function (this: CanvasRenderingContext2D, ...args: unknown[]) {
        count++;
        return Reflect.apply(original, this, args);
      },
    });
  });
  await page.goto("/");
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".street-canvas")!;
    return canvas.getContext("2d")!.getImageData(10, 10, 1, 1).data[3] === 255;
  });
  await page.getByRole("button", { name: "START GAME", exact: true }).click();
  await expect(page.locator(".answer-option").first()).toBeEnabled();
  await page.getByRole("button", { name: "Pause game", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(150);
  const before = await page.evaluate(() =>
    Reflect.get(window, "__scenePaints"),
  );
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => Reflect.get(window, "__scenePaints"))).toBe(
    before,
  );
});

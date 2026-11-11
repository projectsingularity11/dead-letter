import { test, expect } from "@playwright/test";
import { begin, seed, finished } from "./helpers";
for (const [width, height] of [
  [390, 844],
  [360, 800],
  [768, 1024],
  [844, 390],
  [1440, 900],
]) {
  test(`game fits ${width}x${height} with reachable controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await begin(page);
    await page.getByRole("radio").nth(1).click();
    const stamp = page.getByRole("button", { name: /RETURN TO SENDER/ });
    await stamp.scrollIntoViewIfNeeded();
    await expect(stamp).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page
      .getByRole("button", { name: "Reset local records" })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "Reset local records" }),
    ).toBeInViewport();
  });
}
test("200 percent text sizing reflows without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await begin(page);
  await page.addStyleTag({ content: "body{zoom:2}" });
  const stamp = page.getByRole("button", { name: /RETURN TO SENDER/ });
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

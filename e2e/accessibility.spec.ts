import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { begin, seed, finished } from "./helpers";
async function scan(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}
test("home, answering, settings and collection have no automated WCAG A/AA violations", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await scan(page);
  await page
    .getByRole("button", { name: "Practice shift", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeEnabled();
  await page.getByRole("radio").nth(1).click();
  await scan(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await scan(page);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  await scan(page);
});
test("results and review have no automated WCAG violations", async ({
  page,
}) => {
  await seed(page, finished());
  await page.goto("/#/results");
  await scan(page);
  await page.getByRole("button", { name: "Review letters" }).click();
  await page.locator("summary").first().click();
  await scan(page);
});

test("correct and incorrect reveal have no automated WCAG violations", async ({
  browser,
}) => {
  const { fixture, resolved } = await import("./helpers");
  for (const correct of [true, false]) {
    const context=await browser.newContext();
    const page = await context.newPage();
    await seed(page, resolved(fixture(), correct));
    await page.goto("/#/play");
    await page
      .getByRole("button", { name: "Resume shift", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Next letter", exact: true }),
    ).toBeEnabled();
    await scan(page);
    await context.close();
  }
});

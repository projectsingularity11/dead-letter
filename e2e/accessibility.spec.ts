import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { begin, seed, finished, solve } from "./helpers";
async function scan(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
}
test("home, answering, banished, settings and instructions have no axe violations", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await scan(page);
  await page.getByRole("button", { name: "START GAME", exact: true }).click();
  await expect(page.locator(".answer-option").first()).toBeEnabled();
  await scan(page);
  await solve(page);
  await scan(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await scan(page);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "How to play", exact: true }).click();
  await scan(page);
});
for (const caught of [false, true])
  test(`${caught ? "caught" : "escaped"} results and case review have no axe violations`, async ({
    page,
  }) => {
    await seed(page, finished(caught));
    await page.goto("/#/results");
    await scan(page);
    await page
      .getByRole("button", { name: "Review clues", exact: true })
      .click();
    await page.locator("summary").first().click();
    await scan(page);
  });

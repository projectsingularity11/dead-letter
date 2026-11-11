/** Deterministic fixtures and clock controls live only in QA, outside the app bundle. */
import { chromium } from "@playwright/test";
import type { Page } from "@playwright/test";
import { freshRecords, KEY } from "../src/game/persistence";
import { fixture, finished, resolved } from "../e2e/helpers";
import { letters } from "../src/content/letters";
import type { Run } from "../src/game/types";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
await mkdir("qa/screenshots", { recursive: true });
const captured: string[] = [];
const specs: [string, number, number][] = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
  ["narrow", 360, 800],
  ["tablet", 768, 1024],
  ["landscape", 844, 390],
  ["reduced", 1440, 900],
  ["reflow", 720, 450],
];
for (const [name, width, height] of specs) {
  async function open(run?: Run, home = false) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const records = freshRecords();
    records.tutorialDone = true;
    records.preferences.motion = "reduced";
    if (run) {
      records.activeId = run.id;
      if (run.mode === "daily") records.daily[run.date] = run;
      else records.practice = run;
    }
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: KEY, value: JSON.stringify(records) },
    );
    await page.goto(
      `http://127.0.0.1:5173/#/${home ? "" : run?.phase === "results" ? "results" : "play"}`,
    );
    if (run?.phase === "results")
      await page.getByRole("button", { name: /Copy shift receipt/ }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content:
        "*,*::before,*::after{transition:none!important;animation:none!important}",
    });
    if (!home && run?.phase !== "results") {
      await page
        .getByRole("button", { name: "Resume shift", exact: true })
        .click();
      await page.getByRole("radio").first().waitFor();
    }
    await page.clock.install({ time: new Date("2026-11-11T12:00:00Z") });
    await page.clock.pauseAt(new Date("2026-11-11T12:00:01Z"));
    return page;
  }
  async function shot(page: Page, state: string, modal = false) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `qa/screenshots/${name}-${state}.png`,
      fullPage: !modal,
    });
    captured.push(`${name}-${state}.png`);
  }
  let run = { ...fixture("practice"), phase: "answering" as const };
  if (name === "mobile") {
    const longest = [...letters].sort(
      (a, b) =>
        b.claims.reduce((n, c) => n + c.text.length, 0) -
        a.claims.reduce((n, c) => n + c.text.length, 0),
    )[0];
    const same = run.letters.findIndex(
      (l) =>
        letters.find((p) => p.id === l.puzzleId)?.category === longest.category,
    );
    run.letters[same] = {
      puzzleId: longest.id,
      claimIds: longest.claims.map((c) => c.id),
    };
    [run.letters[0], run.letters[same]] = [run.letters[same], run.letters[0]];
  }
  if (["desktop", "mobile"].includes(name)) {
    const page = await open(undefined, true);
    await shot(page, "home");
    await page.close();
  }
  if (name === "reflow") {
    const page = await open(run);
    await page.addStyleTag({ content: "body{zoom:2}" });
    const captureHeight = await page.evaluate(
      () =>
        Math.ceil(
          document.querySelector(".screen-content")!.getBoundingClientRect()
            .bottom,
        ) + 32,
    );
    await page.setViewportSize({ width, height: captureHeight });
    await shot(page, "200-percent", true);
    await page.close();
    continue;
  }
  const page = await open(run);
  await page.getByRole("radio").nth(1).click();
  await shot(page, "answering");
  if (name === "desktop") {
    await page.getByRole("button", { name: /Use a wax seal/ }).click();
    await shot(page, "armed-seal");
  }
  if (["desktop", "mobile", "tablet"].includes(name)) {
    await page.getByRole("button", { name: "Collection", exact: true }).click();
    await shot(page, "collection", true);
    await page.getByRole("button", { name: "Close dialog" }).click();
  }
  if (["desktop", "mobile"].includes(name)) {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await shot(page, "settings", true);
    await page.getByRole("button", { name: "Close dialog" }).click();
  }
  await page.close();
  if (["desktop", "mobile"].includes(name)) {
    for (const correct of name === "desktop" ? [true, false] : [true]) {
      const reveal = await open(resolved(run, correct));
      await shot(reveal, correct ? "correct-reveal" : "incorrect-reveal");
      await reveal.close();
    }
  }
  if (["desktop", "mobile", "narrow", "reduced"].includes(name)) {
    const result = await open(finished());
    await shot(result, "results");
    await result.close();
  }
}
await writeFile(
  "qa/screenshots/manifest.json",
  JSON.stringify(captured, null, 2),
);
console.log(`Captured ${captured.length} deterministic screenshots.`);
await browser.close();

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fixture, finished, longestRun } from "../../e2e/helpers";
import { reducer, commit, duration, makeRun } from "../../src/night/game/rules";
import { emptySave, KEY } from "../../src/night/game/storage";
import { mysteryById } from "../../src/night/content/mysteries";
import type { Run } from "../../src/night/game/types";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
await mkdir("qa/night-walk", { recursive: true });
const manifest: string[] = [];
const answer = reducer(fixture(), { type: "ARRIVE" })!;
const close = { ...answer, remaining: duration(answer) * 0.18 };
const won = reducer(answer, {
  type: "ANSWER",
  values: mysteryById[answer.mysteryId].clues[0].fields.map((f) => f.answer),
})!;
let finalRecord = fixture();
for (let i = 0; i < 7; i++) {
  finalRecord = reducer(finalRecord, { type: "ARRIVE" })!;
  finalRecord = reducer(finalRecord, {
    type: "ANSWER",
    values: mysteryById[finalRecord.mysteryId].clues[i].fields.map(
      (f) => f.answer,
    ),
  })!;
  finalRecord = reducer(finalRecord, { type: "NEXT" })!;
}
finalRecord = reducer(finalRecord, { type: "ARRIVE" })!;
const states: [string, Run | null, string?][] = [
  ["home", null],
  ["intro", makeRun("practice", "2026-11-13", fixture().mysteryId)],
  ["tutorial", reducer(makeRun("tutorial", "2026-11-13"), { type: "ARRIVE" })!],
  ["final-record", finalRecord],
  ["answering", answer],
  ["close-ghost", close],
  ["banished", won],
  ["caught", finished(true)],
  ["escaped", finished()],
  ["settings", answer, "Settings"],
  ["case-files", null, "files"],
  ["long-clue-scrolled", longestRun()],
];
for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
  ["landscape", 844, 390],
] as const) {
  for (const [state, run, overlay] of states) {
    if (name === "tablet" && !["answering", "settings"].includes(state))
      continue;
    if (name === "landscape" && state !== "long-clue-scrolled") continue;
    if (name === "desktop" && state === "long-clue-scrolled") continue;
    if (name === "mobile" && state === "banished") continue;
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const saved = commit(emptySave(), run);
    saved.preferences.motion = "reduced";
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      { key: KEY, value: JSON.stringify(saved) },
    );
    await page.goto(
      `http://127.0.0.1:5173/#/${run ? (["caught", "escaped"].includes(run.phase) ? "results" : "play") : ""}`,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content:
        "*,*::before,*::after{transition:none!important;animation:none!important}",
    });
    if (run && !["caught", "escaped"].includes(run.phase)) {
      await page
        .getByRole("button", { name: "RESUME GAME", exact: true })
        .click();
    }
    if (overlay === "Settings")
      await page.getByRole("button", { name: "Settings", exact: true }).click();
    if (overlay === "files")
      await page.getByRole("button", { name: /Case files/ }).click();
    if (overlay) await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const c = document.querySelector<HTMLCanvasElement>(".street-canvas");
      return (
        !!c &&
        c.width > 0 &&
        c.getContext("2d")!.getImageData(10, 10, 1, 1).data[3] === 255
      );
    });
    await page.clock.install({ time: new Date("2026-11-13T00:00:00Z") });
    await page.clock.pauseAt(new Date("2026-11-13T00:00:00.100Z"));
    await page.waitForTimeout(70);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    if (state === "long-clue-scrolled")
      await page.locator(".submit-answer").last().scrollIntoViewIfNeeded();
    const path = `qa/night-walk/${name}-${state}.png`;
    await page.screenshot({
      path,
      fullPage: !overlay && state !== "long-clue-scrolled",
    });
    manifest.push(path);
    await page.close();
  }
}
await writeFile(
  "qa/night-walk/manifest.json",
  JSON.stringify(manifest, null, 2),
);
await browser.close();
console.log(`Captured ${manifest.length} Night Walk views.`);

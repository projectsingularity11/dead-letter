import { chromium } from "@playwright/test";
import { writeFile, mkdir, readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const label = process.argv[2] || "result";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const runs = [];
for (let i = 0; i < 3; i++) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 80,
    downloadThroughput: 200000,
    uploadThroughput: 90000,
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await client.send("Performance.enable");
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0, longTasks: 0 };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        if (!e.hadRecentInput) window.__perf.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver(
      (l) => (window.__perf.longTasks += l.getEntries().length),
    ).observe({ type: "longtask", buffered: true });
  });
  await page.goto("http://127.0.0.1:4173");
  await page.locator(".start-game").waitFor();
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => ({
    ...window.__perf,
    fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
    resources: performance
      .getEntriesByType("resource")
      .map((r) => ({
        name: r.name.split("/").pop(),
        bytes: r.encodedBodySize,
      })),
  }));
  const metric = async () =>
    Object.fromEntries(
      (await client.send("Performance.getMetrics")).metrics.map((m) => [
        m.name,
        m.value,
      ]),
    );
  const start = await metric();
  await page.waitForTimeout(2000);
  const end = await metric();
  data.idleTaskMs = (end.TaskDuration - start.TaskDuration) * 1000;
  runs.push(data);
  await context.close();
}
const assets = [];
for (const file of await readdir("dist/assets"))
  if (/\.(js|css)$/.test(file)) {
    const bytes = await readFile(`dist/assets/${file}`);
    assets.push({ file, bytes: bytes.length, gzip: gzipSync(bytes).length });
  }
const median = (k) => [...runs].map((r) => r[k]).sort((a, b) => a - b)[1];
const output = {
  conditions: "Chromium, cold cache,80ms latency,1.6Mbps download,4xCPU;3runs",
  median: Object.fromEntries(
    ["lcp", "fcp", "cls", "longTasks", "idleTaskMs"].map((k) => [k, median(k)]),
  ),
  assets,
  runs,
};
await mkdir("qa/performance", { recursive: true });
await writeFile(
  `qa/performance/${label}.json`,
  JSON.stringify(output, null, 2),
);
console.log(JSON.stringify({ label, median: output.median, assets }));
await browser.close();

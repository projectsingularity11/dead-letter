import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const html = await readFile("dist/index.html", "utf8");
const entry = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
if (!entry) throw Error("No production entry");
const js = await readFile(`dist/${entry.replace(/^\.\//, "")}`);
const gzip = gzipSync(js).length;
const fontFiles = (await readdir("dist/assets")).filter((f) =>
  f.endsWith(".woff2"),
);
let fonts = 0;
for (const f of fontFiles) fonts += (await readFile(`dist/assets/${f}`)).length;
if (gzip > 100000) throw Error(`Initial JavaScript exceeds100kB gzip: ${gzip}`);
if (fonts > 45000) throw Error(`WOFF2 fonts exceed45kB: ${fonts}`);
console.log(
  `Performance budget passed: entry ${gzip} bytes gzip; fonts ${fonts} bytes.`,
);

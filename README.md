# DEAD LETTER

**The night post between worlds.** Six letters, one lie in each, and two wax seals to trust your instincts. An original illustrated browser game built from the locked [implementation specification](IMPLEMENTATION_SPEC.txt).

## Run

Requires Node.js 22.12+ (validated with Node 24.22.1) and npm.

```sh
npm ci
npm run dev
```

Vite serves the game on port 5173. No credentials, backend, database, remote fonts, or remote images are needed. If your npm cache location is not writable, use `npm --cache /workspace/.npm-cache ci`.

```sh
npm run typecheck
npm run validate:content
npm run test
npm run test:e2e
npm run build
npm run preview
```

Playwright uses `/usr/bin/chromium` in this cloud environment. Elsewhere install Chromium with `npx playwright install chromium`, then set `CHROMIUM_PATH` to its executable (or adapt the executable selection in `playwright.config.ts`). The browser tests start Vite automatically. They use two workers.

## Play

Daily is seeded by UTC date. Practice chooses a fresh seed and avoids your immediately previous puzzle in each category. Relaxed Practice has no clock. Each shift has one letter per category. Choose the lie, optionally arm a seal, then stamp. A correct answer earns 100 points or 200 with a seal. A wrong submitted seal is consumed. Timeouts do not submit selected answers or consume armed seals.

Keyboard: **1–4** select, **S** arms/disarms, **Enter** submits or continues. Radix radios also support arrows and Space. Modals, navigation, hidden tabs, and the Resume overlay pause answering time. Reloaded shifts require explicit resume. Sound and atmosphere start off; use the header or Settings to opt in.

## Architecture

- `src/game`: pure reducer, scoring, selection, monotonic clock, versioned validation and storage, achievements.
- `src/content`: 36 puzzles, six recipients and structural validator. Claim IDs carry truth; positions do not.
- `src/art`: original reusable SVG artwork. All fonts are bundled locally; licenses ship in `public/licenses`.
- `src/screens`, `src/components`, `src/overlays`: React screens and accessible Radix interactions.
- `e2e`: Playwright journeys, recovery, accessibility and reflow checks.
- `qa/capture.ts`: deterministic screenshot fixture harness, isolated from production. `npx tsx qa/capture.ts` writes the required viewport/state matrix and its manifest under `qa/screenshots`.

Hash routes `#/`, `#/play`, `#/results` and relative build paths allow ordinary static hosting of `dist/`. No rewrite rule is required. No service worker is installed; offline reload is not guaranteed.

Daily selection uses FNV-1a 32-bit hashing over JS UTF-16 code units, Mulberry32, category iteration in the exported fixed order, one random puzzle per category, seeded Fisher–Yates over those puzzles, then each puzzle’s claim IDs. The canonical bank is never mutated. Version and date determine the complete played order. Daily authority is local, not a server anti-cheat system.

Storage uses `dead-letter:records`, schema version 1. Each run commits immutable answers before decoration, snapshots at discrete events, roughly once a second, and on page hide. Stamping restores to reveal; transition restores to the next opening. Invalid runs are rejected without discarding valid collection/preferences/other runs. Reset affects only `dead-letter:` keys. Storage failure leaves a playable in-memory game and an honest warning.

## Current release gate

All 36 records need independent verification of **all four claims**. External institutional/reference sites were denied by this environment’s proxy. Further-reading destinations are candidates, not inspected proof; see [CONTENT_REVIEW.md](CONTENT_REVIEW.md). See [QA_REPORT.md](QA_REPORT.md) for executed checks, screenshot review and remaining limitations, [REFERENCES.md](REFERENCES.md) for design provenance, and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for dependency/font notices.

This task does not publish a site or an environment.

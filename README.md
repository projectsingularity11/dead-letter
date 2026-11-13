# DEAD LETTER — Night Walk

Get Pete home. An8-bit survival mystery set on an empty, rain-soaked city street.

Pete finds a page. A ghost closes in. Solve the clue to destroy it and reach the next block. Eight connected clues build from simple observation to ciphers, timelines, witness deductions and a final answer using earlier evidence. If the ghost reaches Pete, the run ends.

## Run

Node22.12+ and npm. Validated with Node24.22.1 and the committed npm lockfile.

```sh
npm ci
npm run dev
```

```sh
npm run typecheck
npm run validate:content
npm run test
npm run test:e2e
npm run test:performance
npm run build
npm run preview
```

The cloud npm cache can be set with `npm --cache /workspace/.npm-cache ci` if the default cache is unwritable. Playwright uses `/usr/bin/chromium`, overridable with `CHROMIUM_PATH`. Outside this environment, install Chromium and set that path. Build output `dist/` supports static hosting and hash routes without server rewrite rules. No backend, credentials, remote fonts, remote images, or service worker.

## Play

Pete walks into a pixel city and finds eight connected evidence pages. Start Daily to read the opening, then pick up the page. Type every requested fact and press Enter or Submit deduction. There are no multiple-choice answers. Capitalization, harmless spaces, switch ordering, time separators and route arrows are normalized. Field hints show the expected format. Invalid or empty formats cost nothing; a complete wrong deduction costs 35% of that page’s initial time. Three distinct wrong submissions or ghost contact end the run. Identical wrong answers cannot charge twice.

Escape pauses, including while typing. Settings, hidden tabs and Earlier pages pause too. Reload requires Resume. Score is progress: 100, 200, …, 800 per solved page, maximum 3600. Page budgets grow from 65 to 150 seconds.

The two-page tutorial has an untimed, penalty-free first lesson and a real second chase. It is replayable from Home or How to play. It never uses Daily or changes best score.

## Daily calendar

`src/night/content/calendar.json` is a checked-in 100-record content database, dated **2026-11-13 through 2027-02-20**. Persisted seeds build 800 connected evidence puzzles, using varied case data across shared mechanisms. `node scripts/build-calendar.mjs` reproduces this fixed season. Everyone gets the same dated case at **00:00 UTC**, with a countdown, a precise boundary timer and a visibility refresh for sleeping tabs. Existing runs retain their original date. No backend, nightly server task or runtime AI request is needed.

Future cases are locked in the interface. Released cases and three standalone Practice cases can be replayed. After the last scheduled day, Daily is marked season complete and Practice continues. Publish a new calendar to extend the season. Dates and records use the browser; there is no server-authoritative leaderboard or anti-cheat claim.

## Implementation

- `src/night/art`: original integer pixel character matrices, cached street dressing and deterministic canvas city renderer. Native semantic HTML remains outside canvas.
- `src/night/content`: 100 dated case plans, deterministic evidence, explanations, computed solutions and validators.
- `src/night/game`: reducer, score/progression, seeded choices, validated v4 storage.
- `src/night/NightWalk.tsx`: screen and chase controller, overlays, preference handling.
- `src/night/night.css`, `world.css`: pixel UI foundations and the whole-site city styling.
- `src/game/rng.ts`, `src/audio/engine.ts`: deterministic RNG and original opt-in Web Audio.
- `src/tests`, `e2e`: meaningful rules/content, recovery, browser, accessibility and viewport tests.
- `qa/night-walk/capture.ts`: deterministic capture harness. `npx tsx qa/night-walk/capture.ts` recreates the current screenshot matrix.

Current save key: `dead-letter:night-walk:v4`. The app validates all submitted evidence and states, checkpoints outcomes before animation and requires Resume after reload. Only preferences migrate from v3; its old bank scores stay archived. Reset clears only v4. Legacy postal and v3 keys remain untouched. The archived original specification remains in `docs/archive` and source history.

See [NIGHT_WALK_SPEC.md](NIGHT_WALK_SPEC.md), [DESIGN.md](DESIGN.md), [REFERENCES.md](REFERENCES.md), [CONTENT_REVIEW.md](CONTENT_REVIEW.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [QA_REPORT.md](QA_REPORT.md).

Performance measurements and current budgets: see [PERF.md](PERF.md). Menus load separately; fonts are local/preloaded and ambient effects share a cached scene loop.

## Vercel

`vercel.json` selects the Vite build and `dist` output, caches fingerprinted assets for one year, and revalidates the root HTML. Push `main` to deploy through the existing Vercel Git integration. Deployment readiness must be checked in Vercel; a successful Git push alone does not establish a live release.

The city runs edge-to-edge without a page frame or outer gutters. Original street dressing and sparse window/steam/runoff animation deepen the gloomy setting; motion shares the existing renderer and respects pause/reduced motion.

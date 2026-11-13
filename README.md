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

Click an answer or use1–4. Correct answers banish the ghost. Wrong answers cost35% of that clue’s original distance. The same wrong answer cannot cost distance twice. Three wrong choices or an expired chase end the run. Escape pauses. Earlier solved pages are available during later clues; opening them pauses too. Resume after reload/tab hiding is explicit.

Score comes from progress:100 for the first clue,200 for the second, and so on, with3600 for all eight. Speed matters through survival rather than a separate score bonus. Difficulty and chase timing grow together, with 40–75 seconds of active time per page.

Daily rotates through seven mysteries at00:00 UTC; choices use a deterministic FNV-1a / Mulberry32 seed. Practice chooses another mystery, and Retry replays the same mystery in Practice. The finite bank contains56 connected clues, with no live AI judging or outside factual knowledge required. All settings and runs are local. No online leaderboard or anti-cheat claim.

## Implementation

- `src/night/art`: original integer pixel character matrices and deterministic canvas city renderer. Native semantic HTML remains outside canvas.
- `src/night/content`: seven authored mysteries, choices, explanations, solution audits and structural validator.
- `src/night/game`: reducer, score/progression, seeded choices, validated v3 storage.
- `src/night/NightWalk.tsx`: screen and chase controller, overlays, preference handling.
- `src/night/night.css`: the single pixel UI system and responsive layouts.
- `src/game/rng.ts`, `src/audio/engine.ts`: deterministic RNG and original opt-in Web Audio.
- `src/tests`, `e2e`: meaningful rules/content, recovery, browser, accessibility and viewport tests.
- `qa/night-walk/capture.ts`: deterministic capture harness. `npx tsx qa/night-walk/capture.ts` recreates the current screenshot matrix.

Current save key: `dead-letter:night-walk:v3`. The app validates all saved runs, checkpoints results before presentation, saves about once per second while active, and handles blocked storage. Reset clears only the v3 key. Only sound/motion preferences migrate from v2; easier-bank runs and scores do not carry over. Legacy postal and v2 saves remain untouched. The old postal implementation and tests were retired because the user replaced those mechanics; its original specification is retained in `docs/archive` and its source remains in Git history.

See [NIGHT_WALK_SPEC.md](NIGHT_WALK_SPEC.md), [DESIGN.md](DESIGN.md), [REFERENCES.md](REFERENCES.md), [CONTENT_REVIEW.md](CONTENT_REVIEW.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [QA_REPORT.md](QA_REPORT.md).

Performance measurements and current budgets: see [PERF.md](PERF.md). Menus load separately; fonts are local/preloaded and ambient effects share a cached scene loop.

## Vercel

`vercel.json` selects the Vite build and `dist` output, caches fingerprinted assets for one year, and revalidates the root HTML. Push `main` to deploy through the existing Vercel Git integration. Deployment readiness must be checked in Vercel; a successful Git push alone does not establish a live release.

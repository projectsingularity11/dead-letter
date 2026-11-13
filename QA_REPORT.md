# Current QA — whole-site pixel city and 100 Daily cases

The separate website bar is replaced by in-scene controls. The document uses the same original pixel city, brass/wood frames, amber actions, mint ghosts, readable local fonts and pixel-styled input/menu surfaces. Start includes a story introduction. A two-page playable tutorial teaches the controls without using Daily. Typed deductions replace all four-choice answers.

## Checks

- Strict TypeScript and production build: passed.
- Content: 100 consecutive Daily cases / 800 pages, three standalone Practice cases and two tutorial pages validated.
- Unit tests: 40 passed. Coverage includes all 100 case completions, independent clock/route/unknown-tray calculations, solution uniqueness, typed normalization and complete-field requirements, penalties, duplicate protection, invalid formats, tutorial isolation, midnight/date boundaries, storage recovery/migration and painted sprite contact.
- Browser checks: 30 passed after format/focus corrections. A final run also covers a wrong but penalty-free tutorial submission and the lesson-specific score feedback. Includes tutorial completion, no Daily/best mutation, midnight rollover in an open tab, preservation of yesterday's run, future locks, honest season expiry, full Daily completion, keyboard input, format/duplicate protection, pause while typing, recovery, settings, storage denial/reset, sharing, six viewports, 200% reflow and sticky threat visibility.
- axe A/AA checks: Home, active typed forms, banished, caught/escaped results, settings, instructions, case review and tutorial passed in the executed browser suite.
- Build resource budgets: initial JavaScript 92,470 bytes gzip, under 100,000; WOFF2 fonts 38,140 bytes under the 45,000-byte budget. Exact current totals and cold-load measurements belong in PERF.md.

## Visual verification

`qa/night-walk/manifest.json` lists the current 25-view matrix: desktop/mobile Home, introduction, tutorial, answering, final six-field record, approaching ghost, results, settings and notebook, plus tablet and scrolled portrait/landscape evidence. Capture resets document scroll before full-page screenshots. The first batch exposed focus restoration to a nonfocusable body, allowing a skip-link focus jump; restoration now targets the previous control or the clue heading without scrolling. A compact HUD title is capped at two lines to avoid the threat readout. Live text is not pixel-rasterized or animated while reading.

The independent reviewer inspected all 25 captures and found the full pixel world, readable forms, introduction and responsive threat coherent. It requested removing two decorative eyebrow labels and replacing two Unicode action arrows. After a single fix batch and full recapture, its verdict scored both findings resolved and returned ship for those fixes, with no visible regressions. Durable design documentation is completed after this final correction. The Impeccable launcher/detector executable is unavailable in this environment; its reference instructions and existing context were read directly.

## Limits

The calendar is a static content database selected by UTC date, not a remote server database or nightly cron. It runs through February 20, 2027; extending the season requires publishing more content. Cases share puzzle mechanisms with varied data and narrative. Human difficulty calibration, real mobile hardware, other browser engines and screen-reader listening are unrun. Krillion was blocked; no live visual-fidelity claim is made. Additional GitHub references are documented in REFERENCES.md. Vercel live verification has been blocked by the current cloud network policy.

## Edge-to-edge city pass

Removed all outer app gutters, the 1800px shell, perimeter border/inset shadow and brick wallpaper. The city now starts at the browser origin and spans the available width. Four added browser checks verify Home and active play at 360, 390, 1440 and 2560px; the complete 34-test browser suite passed. After removing pointer drift, the responsive/paused-paint suite was rerun. TypeScript and production resource budget passed. Rules/content/storage were unchanged.

Added original cached street dressing: full-height utility poles and sagging wires, tenement fire escape, torn notices, laundry machines, alley utility box, leaning bike, lodging sign, shelter bench/bag/sleeping cat and parked car. Reduced stars, a muted distant skyline and low cloud obscure the moon. Three steam plumes, four runoff drops and one slow window silhouette share the existing loop, with pause/reduced/offscreen skips. Pointer-following drift was removed to keep the world flush to the browser edges.

All 25 viewport/state captures were refreshed. `desktop-city-motion.png` and `city-motion.json` additionally record a normal-motion scene sample: 915 color channels changed in the grate region over 2.1 seconds. This verifies activity in that region, not isolated steam rendering or a new hosting/performance claim. The fresh independent reviewer inspected all 25 state/viewport captures plus the normal-motion sample and found the flush edges, bleak palette, street detail, character hierarchy and readable console coherent. Its sole material finding was stale design persistence. The documenter replaced the old shell/frame guidance and matching sidecar primitive with the source-backed unframed system.

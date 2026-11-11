# DEAD LETTER — QA report

## Delivered scope

The local static React/TypeScript game contains Home, a two-step unscored tutorial, timed Daily and Practice, untimed Relaxed Practice, six-letter answering/reveal loop, seal scoring, receipts and spoiler-free sharing, expanded review, six collectible stamps, settings, About, explicit Resume, and cancel-focused reset. Hash routes and current-run persistence survive navigation/reload. Original flat SVG scene and portraits, local fonts, CSS paper surfaces, Motion choreography, true reduced motion, and opt-in synthesized audio are included.

The game logic is deterministic, local, and independent of decorative completion callbacks. Submitted answers commit before stamping. Timers use `performance.now()` deltas, flush before discrete events, and checkpoint approximately once a second. A selected answer at timeout is unanswered; an unsubmitted seal remains available.

## Commands actually executed

| Check | Result |
|---|---|
| `npm --cache /workspace/.npm-cache ci` | Passed; actual npm lockfile retained |
| `npm run typecheck` | Passed, strict TypeScript |
| `npm run validate:content` | Passed, 36 records; editorial status remains pending |
| `npm run test` | 36 passed across two Vitest files; no skipped/expected-failure tests |
| `npm run test:e2e` | 25 Playwright tests passed in Chromium; no skipped/expected-failure tests |
| `npm run build` | Passed; static `dist/` generated |
| `npm run dev` | Started and used for browser tests and screenshots |
| `npm run preview -- --port 4173` | Started; production HTTP and browser smoke request passed |
| Production preview browser smoke | Invalid direct play recovered to Home; started Relaxed Practice, selected, submitted, reached reveal; zero runtime page errors |
| `git diff --check` | Passed |

The production bundle emits Vite’s advisory for the approximately 514 kB uncompressed main JS chunk (approximately 168 kB gzip). Overlays are dynamically split. This is a performance optimization opportunity, not a failed build.

## Test coverage and outcomes

Pure tests cover scoring and the 800 maximum; seal arming/disarming/consumption; wrong sealed submissions; timeout; duplicate/racing resolution; selection locking; six-round completion; paused/relaxed timing; FNV-1a and Mulberry32 vectors; deterministic puzzle/claim IDs and all six categories; canonical bank immutability; immediate practice non-repetition; content structural constraints; valid saves; malformed, unsupported and nested-corrupt saves; unavailable storage; animation normalization; achievements, duplicate protection and distinct Daily dates; original run date and UTC streaks. Component tests cover disabled stamp, arrow/Space radio behavior, exhausted seals, correct/incorrect reveal labels, and clipboard success/failure fallback.

Browser tests complete all three modes, including a keyboard-only Relaxed Practice shift. They exercise the tutorial, Daily completion reopening, reload with selection/armed seal/time intact, ordinary-settings pause, explicit pause, visibility-change Resume, unfinished Practice from Home after reload, timeout without seal loss, reset and unrelated storage preservation, radio arrows/Space, explicit audio preferences and global mute, blocked storage methods, a denied storage getter, an answer saved during stamping before animation completes, and Practice history retained when starting Daily.

The visibility test dispatches a controlled hidden-document event; it does not rely on the headless browser’s window manager to switch native OS tabs. Clock control lives in Playwright, not in production scoring code.

Responsive tests cover 1440×900, 390×844, 360×800, 768×1024, and 844×390. Each asserts no horizontal document overflow and scrolls essential controls into view. A separate 720×450 viewport with CSS zoom 2 asserts reachable controls and no horizontal overflow.

## Accessibility evidence

axe-core WCAG 2 A/AA and 2.1 AA scans returned zero violations on Home, selected answering, correct reveal, incorrect reveal, Settings, Collection, Results, and expanded Review. Browser keyboard checks verify a complete shortcut-driven shift, native radio arrows/Space, modal focus return, and initial reset-cancel focus. No principal illustration intercepts input or enters the accessibility tree.

These scans and keyboard checks do not constitute a claim of universal accessibility. Screen-reader listening sessions, forced-colors behavior, and cross-browser assistive-technology combinations have not been independently tested.

## Visual capture and inspection

`qa/capture.ts` generates the deterministic 22-image matrix listed in `qa/screenshots/manifest.json`. Fixed fixture puzzle/claim orders and test-only clock/animation controls are outside the production bundle. Captures wait for local fonts; QA-only CSS stops ambient motion and color transitions.

Inspected captures:

- Desktop 1440×900: Home; B selected; armed seal; correct reveal; incorrect reveal; Results; Collection; Settings.
- Mobile 390×844: Home; longest aggregate claim fixture; correct reveal with further-reading sources; Results; Settings sheet; Collection.
- Narrow 360×800: gameplay and Results.
- Tablet 768×1024: gameplay and Collection.
- Short landscape 844×390: gameplay with ordinary document scrolling.
- Reduced motion: gameplay and Results.
- 200% reflow: complete zoomed gameplay document. Playwright’s CSS-zoom/fullPage combination initially cropped this image. The corrected capture keeps width 720 and zoom 2, extending viewport height to include the full document. Actual short-viewport scrolling is separately verified by the responsive test.

The primary agent inspected representative desktop/mobile/reflow images. An independent finish reviewer opened all 22 images. Inspection caught and corrected a paper-backing layer covering the reading surface, decorative desk overflow at zoom, an oversized tool-area moth, missing decorative seals, window intrusion into the header, unsettled narrow color transitions, and a cropped zoom capture. Same paths were recaptured after fixes.

The reviewer also independently reproduced and helped isolate two persistence problems: a stale transition checkpoint and storage lookup outside the guarded body. Both were corrected, covered by regression tests, and independently reproduced as fixed. The verdict pass scored all five reported findings **resolved**. That verdict covers the reported fixes; it is not a new whole-application certification.

A final shallow SVG paper-edge contour, selected-row wooden stamp choreography, subtle ghost blink/lamp brightness, and receipt clipping were completed after the first review. They preserve layout and reduced-motion handling. Final captures retain the same required state matrix. The independent reviewer reopened all 22 refreshed images and confirmed every named state was present, none blank or unexpectedly truncated, and the complete reflow document visible. This final pass confirms capture validity only. Automated motion/gameplay checks were rerun where affected. Audio nodes and opt-in/mute behavior were browser-tested; sound quality was not perceptually assessed.

## Visual rubric

The independent reviewer’s initial judgment was **19/20**, subject to the subsequently resolved findings. This is subjective review, not objective proof.

| Item | Score | Concrete observation |
|---|---:|---|
| Postal identity | 2 | Envelope, crescent crest, lamp, arched window, drawer and ghost clerk establish the setting. |
| Palette | 2 | Cream paper, night teal, brass, and vermilion remain consistent. |
| First action | 2 | The Daily action dominates; both Practice modes remain visible. |
| Claim readability | 2 | Large text, growing rows, and restrained texture retain reading space. |
| Tactile feedback | 1 | Selection and armed seal are visible; static images alone do not establish the entire motion experience. |
| Spacing and typography | 2 | Display, recipient, claims, metadata, and secondary text have distinct roles. |
| Mobile | 2 | Essential controls use normal flow; receipt actions wrap; sheets scroll. |
| Dialogs | 2 | Paper surfaces, local fonts, and muted controls preserve the world. |
| Receipt | 2 | Perforation, six postal outcomes, metrics and souvenir art form a recognizable receipt. |
| Reduced motion / keyboard | 2 | Distinct focus rings, retained information, paused clock, and guarded shortcuts. |

## Remaining release limitations

1. **Editorial gate remains open for all 36 puzzles.** External institutional/reference browsing was denied by the environment proxy. Candidate source titles/URLs were not inspected as evidence, and some are broad portals requiring precise replacement/supplemental links. All records and About disclose `needs-editorial-review`; `CONTENT_REVIEW.md` lists each record. The structural validator does not prove factual truth or difficulty calibration.
2. Browser automation and visual inspection used Chromium only. Firefox, Safari, real mobile hardware, screen-reader listening, and perceptual audio review remain unrun.
3. No service worker is installed; offline reload is not guaranteed. Local records are not server-authoritative or protected against editing, by design.
4. External craft-reference pages could not be studied live. The implementation followed the locked brief, installed package code/types, and original art. Impeccable’s CLI context/detector executable was unavailable; no detector output is claimed. Independent reviewer and documenter agents were used.

No known failing gameplay acceptance check remains in the executed suites. This report does not assert production-ready factual verification, universal accessibility, cross-browser certification, or deployment/publication. No site or environment was published by this task.

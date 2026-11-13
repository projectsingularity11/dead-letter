# Night Walk — current QA

The postal game is superseded by Pete’s8-bit survival mystery. Seven fictional mysteries contain56 connected clues. Correct answers banish a pursuing ghost, wrong answers lose distance, and contact ends the run. The city and controls use a coherent brown/blue-green pixel system.

## Executed checks

- Strict TypeScript: passed.
- Content validator: seven mysteries /56 complete ordered clues passed.
- Vitest:29 passed, including deduction uniqueness, scoring, atomic resolution, storage, and sprite contact boundaries.
- Playwright:26 passed, including Daily escape, Practice keyboard play, mistakes/death, timeout, durable answers, reload/Resume, pause/settings/hidden-tab behavior, sharing, blocked storage, reset, earlier pages, six viewport sizes and200% reflow. Long-clue threat visibility passed in390×844 and844×390.
- axe WCAG A/AA scans: Home, answering, banished, caught/escaped results, Settings, instructions and case review passed.
- Production build and resource budget: passed. Initial JS85,927 bytes gzip; local WOFF2 fonts38,140 bytes.
- Cold production measurements: three baseline and three updated runs under identical throttled conditions; see PERF.md. LCP measured1.064s before and1.148s after (no speedup claimed), while initial JS shrank17.7% and font-related layout shift fell substantially.

## Visual evidence and review

Current captures are listed in `qa/night-walk/manifest.json`. The independent reviewer inspected the original17 views and confirmed the pixel world, broad street and flat divided console follow the requested direction. It found two issues: visible ghost overlap before death and long mobile clues scrolling the threat out of view. The code now computes contact from painted sprite boundaries and retains a compact44px sticky threat bar. Tests cover both.

The19-view matrix adds scrolled longest-clue captures in portrait and landscape. During the deferred-menu pass, review caught two snapshots of a real loading fallback rather than Case files. The capture harness now waits for both the dialog and painted canvas before freezing/capturing. A resize could clear a reduced-motion canvas before its next frame; resize now paints synchronously. A first-paint/paused-draw regression test passes. The independent reviewer reopened all19 corrected captures, found them valid, and marked both sprite contact and persistent threat fixes resolved. It reported no material regressions visible in those captures; continuous effects were not independently reviewed.

The documentation subprocess failed due to a usage limit. DESIGN.md and its JSON sidecar were updated in-thread from the implemented tokens and components using the skill’s fallback guidance.

## Motion and speed

Added pixel puddle ripples, drifting fog, lamp motes, ghost-wake fragments, finite banish pulse, restrained background pointer depth, title tune-in, page/answer transitions and menu fades. Effects share one scene loop and stop under reduced motion. Native semantic controls and Radix modal focus behavior remain intact. Sprite/background caches and offscreen/static skips bound render work. See REFERENCES.md for actual inspected GitHub sources; no third-party effect code was copied.

## Limits

The requested awards-web skill was not found among mounted files or available skills; the user authorized GitHub research as a fallback. Krillion’s live site was blocked, so no exact reference-fidelity claim is made. Browser checks used Chromium; real mobile hardware, other browsers, screen-reader listening and perceptual audio review remain unrun. The user supplied an existing Vercel site (typed dead-letter-five.vercell.app; likely dead-letter-five.vercel.app). Both Vercel and GitHub API deployment checks are denied by the current environment network policy, so hosting latency and live deployment readiness remain unverified. Seven mysteries are finite; difficulty is authored rather than player-calibrated. No service worker/offline reload guarantee, server authority or universal accessibility claim.

Vercel configuration is included for the existing Git deployment: Vite build, dist output, immutable hashed assets, and revalidated root HTML. Git publication and live readiness are recorded separately in the final handoff.

## Harder content pass

Replaced all 56 clues with a shared system of multi-step evidence puzzles and seven case settings. Cipher shifts require page 3, route alibis require page 2, and the final code combines earlier evidence. Increased page budgets to 40–75 seconds. Added v3 save separation with preference-only migration. After the final content changes: content validation, 29 unit tests, 26 browser tests (including axe), strict TypeScript, production build and performance budget passed. Refreshed all 19 screenshots and inspected the longer mobile evidence page. See CONTENT_REVIEW.md for audit coverage and its limits.

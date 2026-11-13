# Performance measurements

`qa/performance/measure.mjs` profiles three cold-cache production navigations using Chromium,80ms latency,1.6Mbps download and4× CPU throttling. The same viewport, waits and cache policy are used before and after. These are local synthetic measurements, not real-user hosting or mobile-hardware results.

| Metric                                        | Baseline median | Updated median | Interpretation                                           |
| --------------------------------------------- | --------------: | -------------: | -------------------------------------------------------- |
| Initial JS, gzip                              |   106,704 bytes |   87,907 bytes | 17.7% smaller initial JS payload                         |
| LCP                                           |         1,064ms |        1,148ms | 84ms slower in this small sample; no LCP speedup claimed |
| FCP                                           |         1,064ms |        1,148ms | No FCP speedup claimed                                   |
| Layout shift                                  |         0.02024 |       0.000053 | Critical font preloads stabilize the initial layout      |
| Main-thread task time during2s ambient sample |         193.8ms |        228.0ms | 34.2ms more work per2s at4×CPU; includes added effects   |

Kept changes: deferred Radix/menu code and removed unused Motion dependency; preloaded critical local fonts; cached pixel sprite canvases and avoided redundant resize/background work; stopped painting static/reduced/paused frames and offscreen canvases; removed the extra records-state update on each timer tick. These preserve timer logic, answers, storage and keyboard behavior.

New effects are bounded and share the existing scene loop: three fog ribbons, three puddle ripples, eight lamp motes, eight ghost-wake fragments and a finite banish pulse. Pointer movement is stored outside React and sampled once per frame. UI transitions use transform/opacity and do not delay button availability. No remote effect assets or new animation dependencies were added.

Budgets: `npm run test:performance` builds then enforces initial JavaScript≤100,000 bytes gzip and total WOFF2 fonts≤45,000 bytes. Current harder-content build:85,927 bytes and38,140 bytes. The cold timing table above measures the earlier effect/performance pass; the replacement puzzle bank was subsequently build-budget checked, not re-profiled. Menu code is a separate chunk, loaded when requested or on utility-control hover.

Reproduce: run `npm run build`, serve with `npm run preview -- --port 4173`, then `node qa/performance/measure.mjs result`. Raw results are retained under `qa/performance`. The production baseline was already around1.1s under these conditions; a deployed URL is required to diagnose any separate hosting/proxy/network delay reported by the user.

## Whole-site pixel world / 100-day calendar

Final build budget: **92,470 bytes initial JavaScript gzip**, **8,927 bytes CSS gzip**, and **38,140 bytes WOFF2 fonts**. Menus remain a separately loaded chunk (~21.8 KB gzip). The dated content database and deterministic puzzle construction fit inside the existing 100 KB initial-JS budget; there are no per-question network calls, remote art/fonts, or added animation packages. The larger calendar, typed forms and tutorial add initial code relative to the earlier seven-case build; no reduction from that build is claimed.

A fresh three-run production sample (before the final decorative-label/icon cleanup), after other browser jobs completed, measured median LCP/FCP **1,312 ms**, CLS **0.00000936**, two long tasks, and 276.3 ms of main-thread task time during a two-second ambient sample at 4× CPU throttling. Same 80 ms / 1.6 Mbps / cold-cache setup; raw evidence is `qa/performance/pixel-world.json`. The larger full-height street paints more area than the old framed scene. These numbers describe local synthetic conditions and do not establish Vercel hosting performance.

## Edge-to-edge city pass

Build budget: **94,086 bytes initial JavaScript gzip**, local WOFF2 fonts **38,140 bytes**. Static street details are painted once into the existing background cache. Animation adds three steam plumes, four runoff drops and one slow window-light/silhouette transition to the same frame loop; paused, reduced and offscreen skips remain. Removed mouse-following pointer handlers and camera offsets. No new library or remote asset. Cold-load timing above belongs to the preceding whole-site build and was not re-profiled for this visual pass.

# DEAD LETTER — current implementation contract

The full document belongs to Pete's pixel city. A broad canvas street, sharply rendered pixel sprites, stepped amber actions, readable local fonts, brass edges and blue-green surfaces extend through Home, introduction, tutorial, evidence, menus, notebook and results. The separate site header is replaced by in-scene controls. Text and controls remain semantic HTML.

Start Daily → untimed narrative introduction → Pick up the page → walking/pickup animation → typed deduction while the ghost approaches → immediate banishment on a correct submission → explanation → next block. Eight solved pages escape. Wrong deductions spend 35% of original page time; three distinct wrong deductions are fatal. Identical normalized wrong submissions do not repeat the penalty. Invalid/empty formats do not spend a penalty. There are no selectable answers or 1–4 guessing keys. Enter submits; Escape pauses even inside a text field.

Calendar: `src/night/content/calendar.json` contains 100 explicit date/seed/story records for 2026-11-13 through 2027-02-20. `scripts/build-calendar.mjs` reproducibly creates that fixed season. `createCase` builds eight connected pages per record from the persisted seed. Case parameters vary across shared mechanisms; these are not 800 individually hand-written riddle formats. The validator checks consecutive dates, distinct case evidence, field formats, solution counts and difficulty order. It also checks three standalone practice cases and two tutorial pages.

At 00:00 UTC, a boundary timer selects the next dated case. A visible second-based countdown and visibility refresh keep open tabs current after sleep. An unfinished run retains its original date; a new date has a separate Daily record. Future cases are locked in Case files. Released cases and three standalone cases can be practised. After February 20, Daily is marked season complete; Practice continues. No seven-day loop, fake new-content promise or scheduled remote deployment is required.

Eight pages: permit window; real event time; room assignment and key room; cipher using the earlier key room; route alibi using the event time; switch interlock; one of four relay mechanisms; six-field final synthesis. Timings are 65, 75, 95, 110, 110, 120, 120 and 150 seconds. Some pages require multiple facts. Explanations show the derivation, not just a verdict. Prior solved pages are readable with the chase paused.

Tutorial: two pages, first untimed and penalty-free with explicit instructions, second a real clock correction and chase. Completion records a tutorial flag, never Daily progress or best score. It is replayable from Home and How to play. A short narrative introduction also precedes every real case.

v4 saves retain typed submissions, normalized misses, active elapsed time, original run date, tutorial completion and preferences. v3 preferences migrate without importing its easier scores. Old keys remain untouched. Reload requires Resume. Score remains progress-based, 100 through 800 per page, maximum 3600; tutorial score is zero.

The renderer preserves integer pixel sprites, cached backgrounds, bounded effects, one frame loop, static/offscreen skips and reduced-motion behavior. At compact widths a 44px sticky threat readout stays visible while reading and typing. All fields, menus and actions remain available at 200% zoom. No new animation dependency is added.

## Edge-to-edge city

The app and main surface have zero exterior padding, no perimeter border or inset shadow, and no maximum width. The scene starts at the browser’s top-left edge and fills its available width on Home and during play, including 2560px desktop. Internal field and notebook boundaries remain functional UI. The body has no surrounding brick wallpaper.

Original cached street dressing adds a laundry, fire escape, overhead wires, damaged notices, lodging sign, bicycle, shelter bench, shopping bag, sleeping cat and dented car. Cloud cover obscures part of the moon; the distant skyline is more muted. A slow window silhouette, three steam plumes and four runoff drops use the existing scene loop and freeze with pause/reduced motion. Mouse-following camera drift is removed.

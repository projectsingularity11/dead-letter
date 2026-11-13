# Night Walk — current implementation contract

This replaces the postal game in `docs/archive/postal-v1-spec.txt`, per the user's redesign request.

Pete walks through a gloomy city at night, finds a paper and picks it up. The paper is a clue in the Daily mystery. A ghost approaches while he answers. Correct answers banish the ghost, wrong answers cost35% of the original chase distance, and contact kills Pete. Three distinct wrong answers are fatal even with no elapsed time. Each wrong choice can be penalized only once.

Eight connected clues become progressively harder: two easy, three medium, two hard, one final synthesis. Each clue allows40–75 seconds of active time. Faster answers banish the ghost sooner. Score reflects progress: clue1 awards100, clue2 awards200, through clue8 awarding800, maximum3600. Pausing, settings, looking at earlier solved pages, hidden tabs and home navigation stop the chase. Reload requires explicit resume.

Seven internally answerable fictional mysteries rotate by UTC day from the11 November2026 epoch. Daily gets a single saved outcome per date. Practice is replayable; retrying after death uses Practice. Choices are deterministically shuffled for Daily. Failed and escaped runs can be shared without answer spoilers. v3 saves use their own namespace. Only preferences migrate from v2; older runs remain archived in their original namespaces.

Visual authority: original low-resolution pixel city; brown brick, ink-blue sky, green-blue spectres, restrained sage interface; full horizontal room; small local pixel fonts; angular, flat controls. No cream postal interface, seals, rubber stamps, trivia categories, bento answer cards, remote imagery or SaaS layout. Use a broad scene above one divided clue console. On narrow screens stack evidence and answers, allow scrolling, retain44px controls, and keep the chase understandable.

Original artwork is drawn on a half-resolution canvas with integer pixel sprites, disabled image smoothing and CSS pixelated scaling. Semantic text, answers and controls remain HTML. Rain and flicker stop under reduced motion; essential threat progress remains visible as stepped position plus numeric distance.

Reference: Krillion was requested for daily ritual, minimal presentation and pixel direction; its live site was blocked. No live visual-inspection or code-reuse claim is made. See REFERENCES.md.

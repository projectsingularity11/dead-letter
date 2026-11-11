---
name: DEAD LETTER
description: The night post between worlds.
colors:
  night-950: "#0b141a"
  night-900: "#101e26"
  night-800: "#172c34"
  teal-700: "#23464b"
  teal-500: "#4b7775"
  ghost-300: "#a8dad0"
  ghost-100: "#ddf2e9"
  paper-100: "#f7eedc"
  paper-200: "#efe1c5"
  paper-300: "#dac49b"
  paper-400: "#b99d73"
  ink-900: "#25302d"
  ink-600: "#5e665c"
  brass-400: "#d7b66f"
  brass-600: "#98743d"
  seal-500: "#b74435"
  seal-700: "#81372e"
  success-700: "#285b4f"
  danger-700: "#8f332d"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  display-compact:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  dialog-heading:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.12
  recipient:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.12
  body:
    fontFamily: '"Source Sans 3", system-ui, sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.45
  claim-compact:
    fontFamily: '"Source Sans 3", system-ui, sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  supporting:
    fontFamily: '"Source Sans 3", system-ui, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  metadata:
    fontFamily: '"Source Sans 3", system-ui, sans-serif'
    fontSize: "12px"
    lineHeight: 1.45
    letterSpacing: "0.08em"
  button:
    fontFamily: '"Source Sans 3", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
  postal-mark:
    fontFamily: '"Special Elite", "Courier New", monospace'
rounded:
  paper: "3px"
  field: "4px"
  action: "5px"
  claim: "6px"
  utility: "8px"
  dialog: "8px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "40": "40px"
components:
  button-primary:
    backgroundColor: "{colors.teal-700}"
    textColor: "{colors.paper-100}"
    typography: "{typography.button}"
    rounded: "{rounded.action}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.success-700}"
  button-stamp:
    backgroundColor: "{colors.seal-500}"
    textColor: "{colors.paper-100}"
    rounded: "{rounded.action}"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.paper-200}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.action}"
    padding: "14px 22px"
  button-danger:
    backgroundColor: "{colors.danger-700}"
    textColor: "{colors.paper-100}"
  utility-button:
    textColor: "{colors.paper-300}"
    rounded: "{rounded.utility}"
    padding: "11px"
  letter:
    backgroundColor: "{colors.paper-100}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.paper}"
    padding: "26px 32px 22px"
  dialog:
    backgroundColor: "{colors.paper-100}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.dialog}"
    padding: "32px"
---

# Design System: DEAD LETTER

## Overview

**Creative North Star: "The night post between worlds."**

A quiet supernatural post office built from midnight teal, warm cream paper, brass, dark wood, and vermilion wax. Original flat vector artwork establishes the room; the letter remains a stable, readable object on the desk. The character is inviting, witty, and slightly uncanny.

This records the existing implementation, governed by the locked `IMPLEMENTATION_SPEC.txt`. Preserve the illustrated postal identity as the interface grows. Reading and completing a six-letter shift take priority over atmosphere, decorative detail, motion, and sound.

**Key Characteristics:**

- Warm documents against a dark, restrained room.
- Tactile stamps, wax, layered paper, and receipt edges.
- Readable claims and explicit answer states.
- Decoration that recedes as the viewport narrows.

## Colors

The exact base palette is recorded in frontmatter and implemented in `src/styles/tokens.css`.

### Primary

- **Midnight and postal teal:** `night-950` through `night-800` establish the room; `teal-700` is the ordinary action background and `teal-500` supports illustrated details.
- **Warm letter paper:** `paper-100` is the reading surface; `paper-200` and `paper-300` separate sheets and secondary surfaces; `paper-400` supplies rules and perforations.

### Secondary

- **Vermilion wax:** `seal-500` marks the start and RETURN TO SENDER actions; `seal-700` adds stamped depth.
- **Aged brass:** `brass-400` picks out the crest, fine accents, and focus on dark surfaces; `brass-600` supplies darker material detail.

### Tertiary

- **Ghost mint:** `ghost-300` and `ghost-100` belong to supernatural artwork and restrained answer effects.
- **Outcome inks:** `success-700` identifies a correct resolution and light-surface focus; `danger-700` identifies a wrong choice and destructive action. Pair outcome color with a mark and written label.

### Neutral

- **Document ink:** `ink-900` is the main paper text; `ink-600` is secondary information on paper.
- Local material and state colors in component CSS remain local details. The scene's final base is (`#182725`); selected/correct claims use (`#e2e8d7`), and wrong claims use (`#f0dfd2`).

**The Reading Surface Rule.** Put document text on warm paper with dark ink; keep atmospheric gradients and grain from competing with glyphs.

## Typography

**Display Font:** Fraunces, with Georgia and serif fallbacks.

**Body Font:** Source Sans 3, with system-ui and sans-serif fallbacks.

**Label/Mono Font:** Special Elite, with Courier New and monospace fallbacks, for sparse postal marks only.

The local Latin subsets are imported in `src/main.tsx`: Fraunces (400, 600), Source Sans 3 (400, 600, 700), and Special Elite (400). Fraunces and Source Sans 3 use SIL OFL 1.1; Special Elite uses Apache 2.0. Keep the distributable notices in `public/licenses/` and the provenance in `THIRD_PARTY_NOTICES.md`. No remote font requests are required.

### Hierarchy

- **Display:** the home title uses the display role, switching to display-compact below the compact breakpoint. Preserve its short, balanced wordmark composition.
- **Headings:** dialog headings use the dialog-heading role; compact dialogs use (28px). Results headings use (30px), or (28px) on compact screens.
- **Recipient:** the recipient role becomes (24px) on compact screens. Subheadings use Fraunces (20px / 1.25).
- **Body and claims:** body uses the body role; compact gameplay claims use claim-compact. Do not shrink gameplay claims below (17px).
- **Supporting text:** use the supporting role for home guidance; dialog and explanatory copy use (16px / 1.5) where implemented.
- **Metadata:** uppercase, spaced sans serif; compact metadata may be smaller because it is supporting information. Essential instructions stay in body text.
- **Buttons:** Source Sans 3 remains the action face. Special Elite is reserved for marks, dates, and short postal annotations.

**The Clear Claims Rule.** Keep full factual statements in Source Sans 3 with comfortable line height; never use distressed type or forced truncation to fit a letter.

## Layout

The utility header and main content are centered within (1180px). Wide gameplay uses a (680px) reading column, a (180px) decorative tool column, and a (32px) gap. The play workspace totals (892px); results narrow to (560px). Main documents grow naturally and the page scrolls. The app uses `min-height: 100dvh`, not a fixed viewport-height reading panel.

| Layout | Viewport | Gutters | Gameplay behavior |
| --- | --- | --- | --- |
| Compact | below 640px | 16px | One column; paper padding 20px; header at least 56px; scene 90px; controls remain in document flow. |
| Intermediate | 640–1023px | 24px | Reading area at most 680px; decorative tool column removed; scene 130px. |
| Wide | 1024px and above | 32px | Paper and tools share the grid; header 72px; scene 160px. |

Spacing is based on the recurring frontmatter steps. Claims stack with an (8px) gap. Their padding is (13px 14px) wide and (14px) compact; claim minimum heights are (68px) and (72px), respectively. Utility controls retain (44px) hit areas. Home uses a taller atmospheric scene (275px wide, 245px intermediate, 190px compact).

Keep long URLs and text wrapping inside the reading column. At zoom or small viewports, allow vertical growth and reachable controls. Decoration must not determine document width or cover claims.

## Elevation & Depth

Depth expresses physical paper and a small illustrated room. It is structural: documents lift from the desk, dialogs sit above the room, and the primary home action has a short solid edge. Do not distribute large shadows across every control.

- **Paper contact and lift:** (`0 2px 2px rgba(0, 0, 0, 0.16), 0 16px 38px rgba(0, 0, 0, 0.24)`).
- **Modal paper:** (`0 24px 80px rgba(0, 0, 0, 0.45)`).
- **Backdrop:** (`rgba(5, 12, 16, 0.72)`) with (`blur(2px)`).
- **Paper stack:** one offset sheet with a second colored contact edge; subtle rotation (0.6deg). Keep the text-bearing rectangle level.

The implemented layer order is scene (0), content (20), decorative effects (35), header (40), modal backdrop (100), modal paper (110), and toast/tooltip (120). The skip link uses (150). Decorative effects have no pointer events.

## Shapes

Paper has nearly square corners; controls are gently softened. Use the frontmatter radii by material: paper, field, action, claim, utility, and dialog. Compact dialog sheets alone use rounded upper corners (`12px 12px 0 0`). Wax seals use the original irregular SVG silhouette rather than a rounded CSS pill.

Paper rules use (`1px solid rgba(37, 48, 45, 0.15)`). Claim borders use (`1px solid rgba(37, 48, 45, 0.25)`). Receipt edges and perforations, the crescent-and-envelope crest, arched window, and restrained stamp rotations carry the postal character.

All principal art is original inline SVG in `src/art/PostalArt.tsx`: the crest, four-pane window with skyline/moon/cloud, brass lamp, moth, friendly ghosts and recipient accessories, envelope, wooden stamp, irregular wax seals, drawer, receipt, and collectible stamps. Preserve responsive viewBoxes, deterministic `useId` references for gradients/clips, `aria-hidden`/`focusable=false` on decoration, and text alternatives outside meaningful illustrations. No imported visual assets or composition image are part of this system.

## Components

### Buttons

Tactile, clear actions. Ordinary primary buttons use postal teal and warm paper text; hover uses outcome green. Secondary buttons use darker paper and ink. Destructive actions use danger ink. The start action and RETURN TO SENDER use vermilion; the latter spans the reading area. Buttons move down (2px) on active press. Disabled controls use explicit muted fills and borders rather than opacity alone.

### Inputs / Fields

The four claim choices are a Radix Radio Group. Keep arrow-key and Space behavior, full-row labels, alphabetical markers, and a trailing radio indicator. Checked choices have a green border/inset and pale green fill. Reveal states add a check/cross and written annotations; color alone never carries the outcome. The seal control is a full-width pressed button with a separate visible armed state, remaining count, and spent-seal treatment.

Settings use Radix Switch and Radio Group. The switch has a (46px) track width within a (44px) minimum-height target and a (22px) thumb. The clipboard fallback is a native textarea with darker paper, ink text, and a paper border.

### Cards / Containers

The central container is a letter, with the original local SVG grain at (0.03) opacity. Two underlying paper tones create physical depth without disturbing the reading area. Results use a narrower cream receipt with dashed dividers and a jagged bottom edge.

### Dialogs

Use the existing Radix paper dialog, with title, description, visible close control, focus containment, Escape dismissal, and restoration to the originating control. Destructive confirmation uses Radix Alert Dialog with the cancel action first. Desktop dialogs are centered, at most (560px), or (760px) for the wide variant, and scroll within `calc(100dvh - 64px)`.

Below the compact breakpoint, dialogs become bottom sheets: full width, `max-height: calc(100dvh - 16px)`, scrollable contents, and bottom padding `calc(24px + env(safe-area-inset-bottom))`. Preserve the reachable close control and focus behavior; no drag gesture is required.

### Navigation

The quiet utility header combines the original crest and Fraunces wordmark with named collection, sound, and settings icon buttons. Maintain the hit areas as the wordmark shrinks. The six-position route strip shows the current letter with brass and a second outline; it sits outside the claims. Secondary links use underlines and sufficient target height.

### Focus and motion

Keyboard focus uses a (3px) brass outline with (3px) offset on dark surfaces, switching to outcome green inside paper, dialogs, and the receipt. Keep the visible skip link and explicit focus transfer to the recipient/reveal/results heading during game progression.

Motion tokens are fast (120ms), standard (220ms), paper (420ms), scene (600ms), with `cubic-bezier(0.22, 1, 0.36, 1)`. Existing scene motion includes slow moth drift, window-confined rain, short envelope opening, and a transient stamp. These remain decorative and cannot block decisions or reading.

System, Reduced, and Full motion preferences resolve through the app's `data-motion` attribute and MotionConfig. Reduced motion removes animations, opening/stamp overlays and answer effects, uses short (100ms) transitions, and removes paper translation. Feedback still appears as readable static content.

## Do's and Don'ts

### Do:

- **Do** preserve the locked postal world and exact base palette.
- **Do** keep claims readable, controls reachable, and content free to grow vertically.
- **Do** pair answer colors with explicit labels and marks.
- **Do** use the original local SVG artwork and retain local font licenses.
- **Do** retain paper-aware focus colors, keyboard behavior, and reduced-motion feedback.

### Don't:

- **Don't** replace the room and documents with generic application cards.
- **Don't** add neon, purple, floating glass, giant gradient blobs, emoji artwork, or photographic collage.
- **Don't** shrink gameplay claims below 17px or texture their glyphs.
- **Don't** let decoration cover controls, intercept input, or dictate mobile reading space.
- **Don't** use hover-only instructions, color-only outcomes, or fixed-height letters that clip content.

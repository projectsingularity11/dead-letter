---
name: DEAD LETTER — Night Walk
description: Pete's midnight pixel city, from street scene to typed deduction.
colors:
  ink: "#101c22"
  sky: "#101e31"
  night: "#142d35"
  panel: "#243c38"
  panel-deep: "#182d30"
  wood: "#54402e"
  edge: "#746044"
  sage: "#70e0bf"
  sage-bright: "#b1f4d1"
  muted: "#bdc9b2"
  text: "#f1ebcf"
  paper: "#e3d6ae"
  danger: "#ffb28a"
  ghost: "#70e0bf"
  gold: "#f7c66d"
  gold-hover: "#ffe1a0"
  action-ink: "#18252a"
  field: "#102b2f"
  field-edge: "#6a9a86"
  evidence: "#343a2c"
  interaction: "#1c3635"
  menu: "#203c37"
typography:
  display:
    fontFamily: '"Press Start 2P", monospace'
    fontSize: "clamp(42px, 5.5vw, 80px)"
    fontWeight: 400
    lineHeight: 1.28
    letterSpacing: "-0.04em"
  title:
    fontFamily: '"Pixelify Sans", "VT323", monospace'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.2
  evidence:
    fontFamily: '"VT323", monospace'
    fontSize: "24px"
    lineHeight: 1.35
  body:
    fontFamily: '"VT323", monospace'
    fontSize: "23px"
    lineHeight: 1.4
  input:
    fontFamily: '"VT323", monospace'
    fontSize: "26px"
    lineHeight: 1
    letterSpacing: "0.035em"
  action:
    fontFamily: '"Press Start 2P", monospace'
    fontSize: "10px"
    lineHeight: 1.5
rounded:
  square: "0px"
spacing:
  field-gap: "8px"
  compact: "16px"
  field-grid: "22px"
  section-gap: "24px"
  console: "32px"
  wide: "40px"
components:
  city-surface:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0px"
    width: "100%"
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.action-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "18px 22px"
  button-primary-hover:
    backgroundColor: "{colors.gold-hover}"
  button-secondary:
    textColor: "{colors.sage}"
    rounded: "{rounded.square}"
    padding: "9px 14px"
  answer-input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.text}"
    typography: "{typography.input}"
    rounded: "{rounded.square}"
    padding: "8px 12px"
  evidence-panel:
    backgroundColor: "{colors.evidence}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "32px"
  menu:
    backgroundColor: "{colors.menu}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "32px"
---

# Design System: DEAD LETTER — Night Walk

## Overview

**Creative North Star: "Pete's midnight pixel city"**

Pete's midnight pixel city fills the document edge to edge. Ink-blue sky, wet pavement, amber signs and mint ghosts continue through the street, evidence console, typed forms and menus; brass and timber define internal interface details. Utility controls belong inside the scene rather than in a separate website header.

Original low-resolution art and local pixel type make the world specific. HTML remains the readable, stable interaction layer: evidence stays still while the bounded street animation carries the chase. Interfaces share the city's material language without becoming rounded web cards.

**Key Characteristics:**

- Original integer pixel sprites and a full-bleed, unframed city scene.
- Amber actions and signage; mint ghost, progress and secondary controls.
- Readable local pixel type and square, stepped HTML controls.
- Stable evidence, explicit typed fields and compact persistent threat feedback.
- Bounded canvas motion, reduced-motion support and deferred menus.

## Colors

The palette pairs amber light and warm brass with blue-black night, damp green surfaces and luminous mint. Frontmatter records the current interface values from `src/night/world.css`, which overrides `src/night/night.css`; the latter still supplies font stacks and base behavior. The canvas renderer separately uses a muted sky (`#121d29`) and subdued skyline beneath a partly clouded moon; this art color does not replace the CSS sky token.

### Primary

- **Amber signage** (`gold`, `gold-hover`): primary actions, title lettering, case identifiers and menu headings. `action-ink` keeps amber controls readable.

### Secondary

- **Spectral mint** (`sage`, `sage-bright`, `ghost`): ghosts, progress, secondary actions and question emphasis. The legacy sage token names remain implementation identifiers.
- **Contact warmth** (`danger`): invalid deductions, destructive settings and imminent contact.

### Neutral

- **Midnight ink** (`ink`, `sky`, `night`): the document, sky and scene depth.
- **Damp timber and brass** (`wood`, `edge`): internal console divisions, fields, utility controls and menu details.
- **Street interiors** (`panel`, `panel-deep`, `evidence`, `interaction`, `menu`, `field`, `field-edge`): distinguish reading, answering and menus without changing worlds.
- **Lamplit paper** (`text`, `paper`, `muted`): primary reading, supporting copy and format hints.

**The Same Street Rule.** Forms, menus and utilities inherit the city’s brass, timber and pixel geometry.

## Typography

**Display Font:** Press Start 2P, monospace fallback.

**Body Font:** VT323, monospace fallback.

**Title Font:** Pixelify Sans, VT323 and monospace fallbacks.

All three are local Latin 400 font packages; retain their OFL licenses. Press Start 2P is the sparse display and control voice, Pixelify Sans shapes readable headings, and VT323 carries longer evidence, instructions and typed values.

Display uses the frontmatter ramp on desktop, becomes 60px at the intermediate breakpoint, then uses `clamp(34px, 7.6vw, 60px)` on compact screens and `clamp(30px, 8vw, 36px)` below 420px. Evidence remains 24px on compact screens and 23px below 420px. Field labels use 21px desktop and 23px compact; hints use 17px and 18px respectively. Keep small pixel labels brief and functional; do not promote incidental metadata sizes into body typography.

**The Stable Page Rule.** Animate the street and brief action feedback; keep evidence and input text stationary.

## Layout

The document reaches the browser edges at every breakpoint, including wide desktop. The app uses `width: 100%`, `max-width: none`, zero margin and zero exterior padding. The main surface and street have no perimeter border or inset shadow, and the body is solid ink without surrounding wallpaper. Scene controls are absolutely positioned inside the city. Internal evidence, form and menu padding still provides reading space; it must not become an exterior page gutter.

The title scene uses a viewport-aware height between 660px and 900px, a stacked DEAD / LETTER title, left-aligned entry actions and a separate tutorial entrance. The run scene is 440px tall on desktop and 390px on compact screens. The evidence and interaction console divides into equal columns with 32px internal padding; it stacks at 850px. Evidence lines are capped at 70ch and the deduction form at 720px, preserving readable content inside the full-width surface. Fields use two columns on wide screens and one on compact screens, with single fields spanning the form. The city scrolls normally above the console; compact play retains a sticky threat strip with a 44px minimum height. Short landscape layouts scroll rather than squeezing reading content into the viewport.

## Elevation & Depth

Muted city silhouettes, stepped lamp light, cyan puddles, cloud cover and sprite outlines create scene depth. Original cached details include laundry, fire escapes, overhead wires, full-height utility poles, damaged notices, a lodging sign, a bicycle, a dented car and a shelter with a shopping bag and sleeping cat. Keep these within the city rather than adding a decorative exterior frame.

HTML depth stays inside the interface: brass rules, stepped button edges and inset field shading. The title uses authored pixel text shadows; menus retain an inset frame and an eight-pixel dark offset. These are crisp pixel materials, not diffuse dashboard shadows or frosted glass. The document perimeter has no border or shadow. Exact internal shadows and brief motion values are carried in the sidecar.

The scene shares one drawing loop with a roughly 30fps cap. Cache backgrounds, static street dressing and sprite canvases, disable image smoothing, and skip unchanged frozen, hidden or offscreen views. Three slow steam plumes, four runoff drops and a slow window resident are sampled inside this loop. Ambient effects stay bounded; pause and reduced motion freeze the scene, and reduced motion disables UI choreography. The camera moves only during Pete’s finite walk; pointer movement does not move it. Essential distance remains available as a number and a stepped progress position.

## Shapes

Controls and panels are square. Two- and four-pixel rules, four-pixel stepped button ends, rectangular switches and crisp SVG paths make the HTML share the world’s pixel scale. Scene coordinates round to integers on a half-resolution canvas; authored sprite matrices remain crisp when scaled.

**The Authored Pixel Rule.** Use original stepped SVG icons and integer sprite drawing; do not substitute Unicode glyph icons.

## Components

### Buttons

Primary buttons use amber with dark ink lettering, a 54px minimum height, square geometry and stepped four-pixel ends. The Start action grows to a 60px minimum height on desktop. Bright inset top edges and darker bottom edges imply material thickness. Hover brightens amber; pressing translates the control down 2px. Secondary text actions are mint and underlined; tutorial entry uses a dark green backing and a stepped arrow.

Interactive controls retain visible focus: amber three-pixel outlines on buttons, links and inputs, with offsets of five pixels for buttons/links and four for inputs. Disabled controls lower opacity and retain their labels. Utility icons have 44px square targets, mint paths, dark cyan surfaces and inset edges; hover turns the path amber.

### Inputs / Fields

Typed answers use native labeled inputs with explicit adjacent format hints. Fields have dark cyan interiors, a two-pixel mint-gray stroke, a four-pixel lower edge, inset dark shading and a 52px minimum height (54px compact). Hover shifts the border mint; invalid fields use warm danger borders and associated error text. All fields must fit the evidence; incomplete formats focus the first invalid field. Status copy distinguishes incomplete, repeated and wrong deductions without replacing the evidence.

### Cards / Containers

The full-width city continues directly into the console without an enclosing frame. Evidence uses a warm olive interior; answering uses a cooler green interior, divided by a brass rule. These are contiguous rooms of one console rather than floating cards. Daily information and story sections retain internal timber divisions and the same broad spacing rhythm.

### Navigation

Home, sound, pause, help and settings controls live inside the upper scene. Authored SVG paths use crisp edges and accessible labels. Daily dates and UTC reset information remain functional text; narrow layouts reduce supporting date detail while preserving the utility targets.

### Menus and settings

Radix dialogs provide focus containment and restoration. Their green surfaces, four-pixel brass borders and inset framing share the city materials. Dialogs scroll within the viewport; compact dialogs use the available width minus 32px. Switches use rectangular tracks and a square 20px thumb. Case rows divide with thin brass rules, and unavailable cases retain readable disabled labels. Menu code loads on demand, independently of local fonts.

### Threat and result feedback

Desktop threat feedback combines a numeric distance and a stepped track within the scene. Compact feedback stays sticky above the console. Safe, paused and banished states have explicit text, and danger uses the same warm error color. Banishment and result transitions are finite; system or explicit reduced motion disables their choreography.

## Do's and Don'ts

### Do:

- Do carry the amber, brass, timber and ink-blue world through every screen.
- Do keep the city full width with zero exterior gutters, perimeter borders or shell shadows at every breakpoint.
- Do use local pixel fonts, original sprite matrices and crisp stepped icons.
- Do retain visible focus, labeled typed fields, explicit formats and readable error feedback.
- Do keep evidence stationary, allow normal scrolling and preserve the compact sticky threat bar.
- Do preserve cached art, the shared bounded drawing loop, deferred menus and reduced-motion behavior.

### Don't:

- Don't restore a centered maximum-width page shell, exterior frame or surrounding brick wallpaper.
- Don't restore the cream postal interface, serif branding or rounded bento cards.
- Don't add decorative eyebrow labels or use text glyphs as icons.
- Don't add scroll hijacking, cursor replacement, repeated flashing or expensive full-screen filters.
- Don't turn typed deductions into multiple-choice answer rows.

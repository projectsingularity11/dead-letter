---
name: DEAD LETTER — Night Walk
description: A pixel-art survival mystery.
colors:
  ink: "#141d1c"
  sky: "#15252d"
  night: "#1b2c30"
  panel: "#242d29"
  panel-deep: "#1b2522"
  wood: "#453b31"
  edge: "#59513e"
  sage: "#a3b393"
  sage-bright: "#c3d0ab"
  muted: "#a5ac94"
  text: "#dfdec5"
  paper: "#cdc7a5"
  danger: "#e79c80"
  ghost: "#8bc6af"
  gold: "#ceb884"
typography:
  display:
    fontFamily: '"Press Start 2P", monospace'
    fontSize: "clamp(30px, 4.1vw, 68px)"
    fontWeight: 400
    lineHeight: 1.25
  evidence:
    fontFamily: '"VT323", monospace'
    fontSize: "22px"
    lineHeight: 1.35
  title:
    fontFamily: '"Pixelify Sans", monospace'
    fontSize: "31px"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  square: "0px"
spacing:
  compact: "16px"
  console: "32px"
  wide: "36px"
components:
  button-primary:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "17px 24px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.sage-bright}"
---

# Design System: DEAD LETTER — Night Walk

## Overview

**Creative North Star: "The midnight street"**

A coherent8-bit city frames a survival mystery. Brown brick and wet pavement sit beneath a blue-green sky; Pete and the ghost carry the drama. Angular HTML controls remain readable alongside the pixel world.

The user's Night Walk request supersedes the archived postal design. The scene uses the available horizontal room. Motion comes from the street and chase, with brief interface feedback.

**Key Characteristics:**

- Original low-resolution city and integer pixel sprites.
- Local pixel fonts and a restricted material palette.
- Flat answer rows, one divided clue console, compact paper-free menus.
- Bounded ambient effects, persistent threat feedback, reduced motion.

## Colors

Primary sage identifies actions and progress. Ghost green marks the pursuing threat and banishment. Warm danger identifies a wrong answer or imminent contact. Brown panels and ink-blue backgrounds keep text distinct from the city.

The frontmatter colors are extracted from `src/night/night.css`; that file is the implementation source of truth.

## Typography

Press Start2P supplies display text and compact controls. VT323 supplies22px evidence and readable answer text. Pixelify Sans supplies31px clue headings and score figures. Use the local OFL font packages and retain their licenses.

Display sizing becomes23–39px on narrow screens. Evidence remains22px on mobile; allow wrapping and scrolling. Keep metadata short. Do not restore the previous serif and typewriter typography.

## Layout

The app spans the viewport up to1800px, with36px desktop gutters and16px compact gutters. A broad street sits above a divided evidence/answer console. At850px and below the console stacks, and a44px sticky threat bar stays visible while scrolling. The street itself is not pinned over the controls. Short landscape layouts scroll normally. Controls remain reachable at200% zoom.

## Elevation & Depth

Depth belongs to city silhouettes, stepped lamp light, puddles, ghost particles and pixel outlines. Interface surfaces use tonal separation and sharp borders. Tiny offset shadows belong to the pixel lettering and menu frame; do not add diffuse dashboard-card shadows or frosted-glass panels.

## Shapes

Square controls, two-pixel frame rules, shallow stepped corner details and pixel icons. The city is drawn on a half-resolution canvas with image smoothing disabled. Character assets are authored pixel matrices and are cached into small canvases.

## Components

Primary actions use sage with ink lettering, a pale border and a tiny inset pixel edge. Hover moves the arrow3px; pressing moves the control2px. Answer rows are flat with a key number, text, divider and state indicator. Wrong choices retain readable warm text and become unavailable.

Menus use Radix focus containment and restoration behind pixel styling. Their code is dynamically loaded when needed. Font loading is independent of that menu chunk.

The scene shares one30fps drawing loop. Backgrounds and sprites are cached; unchanged paused/reduced-motion views and offscreen canvases skip drawing. Fog ribbons, puddle ripples, eight lamp motes, a ghost wake and finite banish pulse use bounded loops. Pointer movement affects only the background by at most a few pixels. Reading text does not follow the pointer.

Brief title tune-in, menu fade, page pickup, answer readiness and banish transitions reinforce actions. System and explicit reduced motion stop ambient travel, flicker, rain and UI choreography. Essential ghost distance remains represented numerically and with stepped position. Sprite contact uses actual painted boundaries so zero distance corresponds to first contact.

## Do's and Don'ts

- Do keep the scene broad, controls flat and reading text stable.
- Do preserve visible focus, accessible native answers and the sticky compact threat bar.
- Do retain local assets, deferred menus and the shipped-resource budgets.
- Don't return to the cream postal interface, seals, rounded bento controls or serif branding.
- Don't add scroll hijacking, cursor replacement, repeated flashing or expensive full-screen filters.
- Don't claim an exact Krillion/Awwwards-site match: live reference access was limited.

---
name: Imagination Gym
description: A focused drawing-practice interface with condensed headings and orange actions.
colors:
  canvas: "#e2e2df"
  card: "#f7f6f2"
  ink: "#070607"
  accent: "#fc5000"
  accent-ink: "#b03500"
  on-accent: "#070607"
  sulfur: "#f5f28e"
  danger: "#9d2b2b"
  success: "#107c41"
typography:
  display:
    fontFamily: "Bebas Neue, Impact, sans-serif"
    fontWeight: 400
    fontSize: "64px"
    lineHeight: 1.05
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  page-mobile:
    fontFamily: "Bebas Neue, Impact, sans-serif"
    fontSize: "44px"
  control:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
rounded:
  control: "12px"
  action: "14px"
  card: "20px"
  panel: "24px"
  pill: "800px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.action}"
    height: "44px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Imagination Gym

## Overview

Extracted from the working Svelte interface, `src/app.css`, and the original `Imagination Gym.dc.html` prototype using Impeccable. This is the project's evidence-based reference, not a claim to reproduce an external Caldera specification. The user confirmed there is no external reference and authorized extraction from the design.

Preserve the existing contrast between condensed display headings and readable everyday controls. The interface supports practice, timing, notes and peer feedback; visual treatment should help users find their next action.

## Colors

The light palette above is normative. Runtime variables in `src/app.css` own both themes. Use semantic variables, never substitute fixed light colors in components. Orange identifies primary actions and active states; `--accent-ink` is the more legible orange for small text. Use `--on-accent` for text on orange, not white.

Dark mode retains the same roles: canvas `#121211`, card `#1d1d1b`, ink `#eceae4`, accent `#ff5c12`, on-accent `#0d0c0b`. Error and success have explicit dark overrides. Muted ink, dividers and tracks already have theme-aware alpha tokens; numeric suffixes are legacy names, not literal opacity percentages.

## Typography

Use `--font-display` for page and major section headings; `--font-body` for reading, controls and small instructional headings. Existing page titles commonly use 64px desktop and 44px phone; section titles use 28–36px. These are observed roles, not permission to invent intermediate sizes.

Body copy uses `--text-body` (16px) and `--leading-body` (1.5). Standard control text uses `--text-control` (14px). Compact metadata and controls currently vary between 11–15px. That variation is an audit backlog, not a newly approved universal scale. Do not turn essential instructions into tiny metadata. Timers retain their distinct large numerals.

## Layout

Existing content containers commonly cap at 1100px, with 36px/44px desktop padding and 24px/18px phone padding. Preserve the desktop sidebar and phone bottom navigation. Account for bottom navigation when placing actions. Long reading text should stay near 65–75 characters per line.

Related controls group tightly; separate sections more generously. Tables and the eight-week ladder may scroll within their own region. The document itself must not overflow horizontally. A phone Today view places the timer before lesson details.

## Elevation & Depth

Neutral surface contrast and thin theme-aware borders provide default separation. Drawer and modal shadows indicate actual overlays. Avoid adding decorative shadows to ordinary cards. Preserve existing motion tokens and reduced-motion handling; do not introduce new easing curves for routine actions.

## Shapes

Use the shared radius tokens above: controls, compact actions, cards, large panels, and pills. These values are extracted from repeated implementations. A pill is for compact controls and progress tracks, not large content panels. Context-specific asymmetric corners and icon geometry are exceptions; do not mechanically flatten them into the shared scale.

## Components

- Primary actions use accent/on-accent; secondary actions use card/ink and a line border. Keep a visible keyboard focus state and a minimum 44px touch target.
- Inputs use body typography, visible labels, theme surfaces and the existing accent focus outline. Placeholders supplement labels.
- Cards use the card surface and one boundary treatment. Avoid nesting cards merely to group text.
- Navigation uses the shared palette and existing icons. Active state must remain legible in both themes.
- Dialogs isolate the background, provide a named close control and manage keyboard focus. Exercise details restore focus to their opener.
- Progress labels must remain legible at both zero and full completion; keep labels outside fills when contrast depends on fill height.

## Do's and Don'ts

- Do preserve the existing fonts, palette, content and workflows while normalizing repeated patterns.
- Do check the rendered result in light/dark and desktop/phone contexts.
- Do record deliberate new values and their role here before proliferating them.
- Don't treat every inherited one-off as a design-system token.
- Don't claim full accessibility or visual conformance from token substitution alone.
- Don't redesign the welcome illustrations in this pass; the user deferred that work.

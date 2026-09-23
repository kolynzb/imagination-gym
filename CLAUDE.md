# Project instructions

## Slop detector

Self-check every design against this catalog before delivering (adapted from
impeccable.style/slop, 67 patterns). Treat a hit as a reason to look closer, not
an automatic fail — an intentional, design-system-grounded choice wins.

### Design system
The extracted system in DESIGN.md is binding. It is derived from this app and
its original prototype; no external Caldera reference exists. Use the shared
tokens in src/app.css. Flag unrecognized values and document deliberate additions.

### Visual details
- Decorative grid-line backgrounds (keep grids only for canvases/maps/measurement)
- Thick colored border on a rounded element — border and radius compete
- Glassmorphism as decoration (blur/glass/glow with no real layering problem)
- Side-tab accent stripe on a card that carries no status or warning
- 1px hairline border *plus* a wide soft shadow — pick one edge treatment
- Repeating-gradient stripes used as filler texture
- Extreme border-radius on small cards (blob effect, squeezed content)
- Rough hand-coded SVG mascots/illustrations — use real assets or nothing

### Typography
- Small eyebrow label above a heading (fold the useful words into the heading)
- Tiny interface text in nav, links, controls
- Flat hierarchy — heading and body nearly the same size/weight
- Rounded icon tile stacked above a heading (the AI feature-card tell)
- Oversized italic serif display headline as a shortcut to "editorial"
- Pill/badge above the main headline
- Oversized hero headline that fills the first screen alone
- Crushed letter spacing on display type
- Overused fonts: Inter, Geist, Roboto, Arial
- One family everywhere reading flat — vary size/weight/spacing first
- All-caps body text (uppercase is for short labels and headings)

### Color & contrast
- Radial-gradient background halo
- Soft spotlight glow behind a section
- Purple gradient + bright cyan on dark = AI default palette
- Dark mode with glowing accents (neon-by-reflex)
- Gradient text across a heading or number
- Gray text on a colored surface — washed out; use a tint or light ink
- Cream/beige as a reflex "tasteful default"

### Layout & space
- Tiny numbered section labels (01 / 02 / 03) where no sequence exists
- Cards flush against a horizontal scroller's edge — pad both ends
- Text covered by an opaque layer
- Unbalanced opening columns leaving a large gap
- Heading closer to the previous section than to its own content
- Hero metric layout: huge number, small label, three stats
- Identical card grids giving every point equal weight
- Monotonous spacing — equal gaps everywhere destroy grouping
- Nested cards (card in card in card) — use spacing, type, dividers
- Line length beyond ~75 characters
- Content overflowing its container / sideways page scroll
- Menus, tooltips, popovers clipped by an ancestor's overflow

### Motion
- Pulsing status dot when nothing is happening
- Decorative blinking cursor on static copy
- Auto-scrolling marquees of text or logos
- Bounce/elastic easing on routine transitions
- Animating width/height/margin instead of transforms
- Every image zooming or rotating on hover

### Copy
- Same label repeated in several slots of one card
- Em-dash in every sentence
- Generic marketing claims: supercharge, world-class, enterprise-grade,
  next-generation, seamless
- Forced contrast constructions ("Not a feature. A platform.")
- Calling things "theater" — name what's ineffective and why

### Imagery
- Placeholder-style illustrations built from generic circles and blocks
- Jagged "torn edge" image masks
- Images buried under near-opaque overlays
- Broken, empty, or placeholder image sources

### General quality
- JavaScript errors on load
- Content stuck at opacity 0 because a reveal handler never ran
- Cramped padding — text pressed against a button or card edge
- Body text touching the viewport edge (no container padding)
- Justified body text
- Contrast below WCAG AA (4.5:1 body, 3:1 large text)
- Skipped heading levels (h1 → h3)
- Line height below ~1.5 on body copy
- Body text below 16px
- Wide letter spacing on body copy

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

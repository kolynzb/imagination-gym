# Extracted design system audit

DESIGN.md is derived from the existing app and prototype at the user's request. Shared fonts and repeated corner radii are now centralized in src/app.css. Existing color and motion tokens remain authoritative. This pass preserves the visual identity.

The initial Impeccable detector scan produced these findings before the documented display/mobile/control size entries were expanded:

- design-system-font-size: 245
- design-system-radius: 21
- design-system-color: 5
- layout-transition: 3
- side-tab: 4

These are advisory findings, not all confirmed defects. Typography variants, one-off radii, and existing decorative patterns need a separate bounded normalization pass; the deferred illustrations are not changed. Do not expand the normative scale solely to silence the detector.

Validation: 59 unit tests, type checks and build passed. Live token values and Today rendering checked.

## Instructional text normalization

Exercise correction text and Method setup/scaffolding explanations now use shared 16px body text and 1.5 line height; compact metadata remains distinct. Exercise search has a stable accessible name and a 44px clear target; drawer actions also have a 44px minimum target. Phone exercise inspection confirmed 16px text, 44px clear control and no horizontal overflow. Six practice UI tests, type checks and build passed. Detector advisories for other existing variations remain; this is not a claim of full normalization.

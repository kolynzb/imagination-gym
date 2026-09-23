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

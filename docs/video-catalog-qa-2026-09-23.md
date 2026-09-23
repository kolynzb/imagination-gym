# Video catalog QA — 2026-09-23

Audited all 30 Video Vault embeds in the authenticated production desktop browser, filtering each learning phase and waiting for the YouTube player to load. 28 showed the player and Play control. Two explicitly reported “Video unavailable.” This is availability evidence, not full-duration playback verification for every lesson.

## Corrections

- Peter Han: unavailable `1L1bQo4W81U` replaced by Proko's **Training Yourself to Draw From Imagination – Peter Han**, `6-8ED4DW6A0`. The card now uses the replacement's actual subject; it no longer promises a dedicated line-weight lesson.
- Drawabox: unavailable `d0e3rFpS04o` replaced by **Lesson 1, Exercise 2: Ghosted Lines**, `LkJG6pKTuRc`. The title accurately narrows the subject. The broader official Lesson 1 reference remains in the curriculum.
- **Understanding Every Type Of Clothing Fold**, `d07NanfYT8U`, belongs to Marco Bucci. Corrected the Vault and Week 6 reference credits.

Sources: https://www.youtube.com/watch?v=6-8ED4DW6A0 and https://www.youtube.com/watch?v=LkJG6pKTuRc; creator/title attribution also checked against rendered YouTube players.

## Coverage

| Phase | Original players loaded | Unavailable |
| --- | ---: | ---: |
| Core methodology | 4 | 0 |
| Weeks 1–2 | 6 | 2 |
| Week 3 | 4 | 0 |
| Weeks 4–5 | 6 | 0 |
| Weeks 6–7 | 5 | 0 |
| Week 8 | 3 | 0 |

Svelte/TypeScript check: zero errors and warnings. Production build passed. Code release: `f27cc02`.

Physical-device playback remains unverified. Third-party availability can change after this audit.

## Deployed verification

Vercel reported success for `f27cc02`. Reloaded production, restored the authenticated QA room, and opened each replacement through Vault search. Peter Han displayed playing controls, captions and elapsed 0:01 of 28:09. Drawabox displayed playing controls and elapsed 0:03 of 10:32. Both have actual playback-start evidence in the app, beyond a loaded thumbnail.

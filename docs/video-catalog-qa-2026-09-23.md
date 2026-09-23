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

## Complete playback-start pass — 2026-09-23

All 30 deployed Vault entries were started through their embedded Play controls in the authenticated production desktop browser. Each showed elapsed playback greater than zero; no unavailable/error state was observed. Players were tested in learning-phase groups, then unloaded by changing the Vault filter. This closes the catalog playback-start check, not a full-duration editorial review or physical-phone test.

| Video ID | Observed elapsed seconds |
| --- | ---: |
| zYzgxUVSpUc | 17 |
| A9YhcZIwH3c | 13 |
| tYanSuLS2i4 | 16 |
| BKiopm83L8c | 17 |
| 6-8ED4DW6A0 | 7 |
| LkJG6pKTuRc | 8 |
| oK-4wUbBmJI | 7 |
| VBAJDepILYc | 7 |
| Jwti08d0jYk | 15 |
| BHvXszH1fdI | 7 |
| AabFcueorqg | 7 |
| NijDzUGNVfQ | 7 |
| 6xUqTKQrMr0 | 6 |
| w3ROXZLZZ_k | 6 |
| f5Bq-ugRv3E | 6 |
| YY5jVOwz4Pg | 6 |
| RDPVo6TPPbk | 3 |
| WkmZLi8bNBM | 3 |
| EL5kn_GLq40 | 3 |
| J9MYR-BLzNg | 3 |
| KjgSYqr77C0 | 2 |
| gvro2NslMfA | 2 |
| 1qIy7LyYLnI | 3 |
| d07NanfYT8U | 2 |
| FBXb8woYQn0 | 2 |
| 4Y0XVPprbYY | 2 |
| -2xhmKLsPO8 | 2 |
| fSCz8akhJzw | 3 |
| _YuSTSfl-7s | 3 |
| dWrT-MakDIc | 2 |

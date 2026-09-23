# Open bugs and verification gaps

This is the current open-work list. Earlier QA reports are historical findings; completed fixes and evidence are recorded in qa-fixes-2026-09-23.md.

## AUTH-01 — Refresh requires Google sign-in again (resolved)

- Status: fixed and verified in the production desktop browser (release `3ed74d0`, 2026-09-23). Physical-phone verification remains a separate gap.
- Priority: P2 usability defect. Saved progress is recoverable; this is not observed data loss.
- Reproduction: sign in, save a note and pause a timer, reload the page. The welcome/sign-in screen returns. Complete Google sign-in again: the note and paused timer restore.
- Evidence: production QA room QA-PROD-20260923 restored the exact QA note and 09:53 timer after reauthentication.
- Expected: restore a valid session on reload without an unnecessary manual sign-in step; show sign-in when the session has expired or been revoked.
- Investigation: inspect the Google credential lifecycle and Convex authentication integration; distinguish missing session restoration from token expiry and browser restrictions. Select a supported session mechanism before implementation. Do not treat persisting a raw Google ID token as a complete session solution.
- Acceptance: reload and a new tab recover a valid authenticated session; expired/revoked sessions request sign-in; explicit sign-out remains signed out; account switching cannot reveal the prior account's progress; note/timer recovery still passes. Verify in production and a normal phone browser.

## Verification gaps (not confirmed defects)

- Separate physical-device sign-in and progress recovery.
- Physical-device video playback. The desktop catalog check is complete: all 30 videos started and advanced beyond zero seconds in production. See video-catalog-qa-2026-09-23.md for per-video evidence. Full-duration viewing was not part of this smoke test.

## Deferred work

- Opening illustrations: user deferred the redesign; research exists in the separate illustration task.
- Further visual refinement should be a bounded, prioritized pass against DESIGN.md, not an indefinite series of cosmetic edits.

### AUTH-01 investigation checkpoint — 2026-09-23

The Google credential is held only by the in-memory Convex auth callback. Reload destroys it. Added Google's supported One Tap automatic selection request alongside the existing manual button, plus `disableAutoSelect` on successful explicit sign-out and prompt cancellation on view teardown. No credentials are persisted in browser storage.

Validation: Svelte/TypeScript check clean, 63 unit tests pass, 21 mocked-provider browser regressions pass. Real Google manual sign-in on localhost restored existing QA progress. Navigating back to localhost still showed the welcome screen: automatic restoration is **not proven and AUTH-01 remains open**. Google documents consent requirements, browser restrictions and a ten-minute FedCM automatic-sign-in cooldown; One Tap alone cannot meet the durable-session acceptance criteria.

Next implementation needs a supported application-session integration with renewal and revocation, preserving existing Convex `tokenIdentifier` ownership. Test migration/account identity continuity before deployment. This checkpoint is not production release evidence.

Reference: https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out

### AUTH-01 closure — 2026-09-23

Replaced memory-only authentication with verified Google-to-Convex Auth sessions, renewable tokens, server-side revocation, scheduled absolute expiry, and account-scoped pending-draft recovery. See `auth-sessions.md` for the implementation and deployment model.

Production backend deployed to `successful-iguana-581`; frontend commit `3ed74d0` pushed to GitHub and Vercel reported success. Real Google sign-in restored room `QA-PROD-20260923`, the exact existing production QA note, and paused timer `09:53`. Full reload and a fresh second tab both restored the authenticated course without another Google click. Explicit sign-out cleared both tabs; reloading remained signed out.

Validation: 78 unit/backend tests, 21 browser regressions, clean Svelte/TypeScript checks and production build. Short-lived (30-second) development tokens exercised renewal; that temporary setting was removed. Account isolation, expiry, revocation and unsaved-draft conflict recovery have automated coverage. Separate physical-device coverage and the full video catalog remain open; opening illustrations remain deferred.

### Video catalog closure — 2026-09-23

Release `f27cc02` replaced two unavailable embeds and corrected Marco Bucci attribution in the Vault and curriculum. Vercel reported success. Both replacement videos started playback in the production app (Peter Han elapsed 0:01; Drawabox elapsed 0:03). All 30 catalog entries have player-load availability evidence; this does not claim every lesson was watched in full.

# Open bugs and verification gaps

This is the current open-work list. Earlier QA reports are historical findings; completed fixes and evidence are recorded in qa-fixes-2026-09-23.md.

## AUTH-01 — Refresh requires Google sign-in again

- Status: open; reproduced on production after the approved backend deployment.
- Priority: P2 usability defect. Saved progress is recoverable; this is not observed data loss.
- Reproduction: sign in, save a note and pause a timer, reload the page. The welcome/sign-in screen returns. Complete Google sign-in again: the note and paused timer restore.
- Evidence: production QA room QA-PROD-20260923 restored the exact QA note and 09:53 timer after reauthentication.
- Expected: restore a valid session on reload without an unnecessary manual sign-in step; show sign-in when the session has expired or been revoked.
- Investigation: inspect the Google credential lifecycle and Convex authentication integration; distinguish missing session restoration from token expiry and browser restrictions. Select a supported session mechanism before implementation. Do not treat persisting a raw Google ID token as a complete session solution.
- Acceptance: reload and a new tab recover a valid authenticated session; expired/revoked sessions request sign-in; explicit sign-out remains signed out; account switching cannot reveal the prior account's progress; note/timer recovery still passes. Verify in production and a normal phone browser.

## Verification gaps (not confirmed defects)

- Separate physical-device sign-in and progress recovery.
- Full video catalog availability: sampled embedded roadmap playback is proven, not all 30 videos.

## Deferred work

- Opening illustrations: user deferred the redesign; research exists in the separate illustration task.
- Further visual refinement should be a bounded, prioritized pass against DESIGN.md, not an indefinite series of cosmetic edits.

### AUTH-01 investigation checkpoint — 2026-09-23

The Google credential is held only by the in-memory Convex auth callback. Reload destroys it. Added Google's supported One Tap automatic selection request alongside the existing manual button, plus `disableAutoSelect` on successful explicit sign-out and prompt cancellation on view teardown. No credentials are persisted in browser storage.

Validation: Svelte/TypeScript check clean, 63 unit tests pass, 21 mocked-provider browser regressions pass. Real Google manual sign-in on localhost restored existing QA progress. Navigating back to localhost still showed the welcome screen: automatic restoration is **not proven and AUTH-01 remains open**. Google documents consent requirements, browser restrictions and a ten-minute FedCM automatic-sign-in cooldown; One Tap alone cannot meet the durable-session acceptance criteria.

Next implementation needs a supported application-session integration with renewal and revocation, preserving existing Convex `tokenIdentifier` ownership. Test migration/account identity continuity before deployment. This checkpoint is not production release evidence.

Reference: https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out

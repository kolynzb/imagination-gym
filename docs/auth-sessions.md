# Google sign-in and application sessions

Google Identity Services supplies a credential only at sign-in. The server verifies its RS256 signature against Google's keys, issuer, client audience, expiry, and subject, then Convex Auth issues a renewable application session. Google credentials are not persisted.

The Svelte adapter manages application access and refresh tokens in its deployment-scoped browser storage, including refresh rotation. Sessions last at most 30 days and expire after seven days of inactivity; access tokens last ten minutes. `AUTH_JWT_DURATION_MS` can shorten development tokens for renewal testing (minimum 30 seconds); leave it unset in production. Explicit sign-out revokes the server session and clears adapter storage. A reactive server status check closes revoked sessions in other tabs; unauthenticated token negotiation is distinguished from revocation.

Existing member and critique ownership stays keyed by `https://accounts.google.com|<verified Google subject>`. Auth users store that verified mapping. No email-based linking or bulk rewrite of progress is performed. The previous Google JWT provider remains accepted during rollout, so the older deployed frontend continues working while the new one is built.

Session restoration suspends cloud writes before changing identity. Unsaved progress is checkpointed separately in member-scoped sessionStorage and recovered only after the server returns that member ID. Recovery uses the original cloud revision and merge baseline, retaining conflict checks. If storage is unavailable, existing keep-this-tab-open warnings and unload protection still apply. Explicit sign-out first saves pending progress.

## Deployment

Both Convex environments require `GOOGLE_CLIENT_ID`, `JWT_PRIVATE_KEY`, and `JWKS`. Generate a separate RSA signing pair per environment using Convex Auth's documented setup; never put private keys in frontend variables, Git, or chat. `CONVEX_SITE_URL` is supplied by Convex. Production is `successful-iguana-581`; development is `clever-alpaca-841`.

Deploy the backward-compatible backend first, then push the frontend to GitHub for Vercel. Preserve existing signing keys when redeploying. A new session is established on the next Google sign-in; subsequent reloads restore it without Google interaction.

## Validation

Backend tests cover existing-member identity continuity, account isolation, malformed credentials, deleted and expired sessions, scheduled cleanup, and the difference between unauthenticated negotiation and revocation. Store tests cover same-member draft recovery, preventing recovery into another account, retaining remote conflicts, and cancelling queued writes when a session is suspended.

Real development browser checks covered Google sign-in, full reload, a new tab, cross-tab sign-out, signed-out reload, and renewal with a 30-second access token. Production release evidence is recorded separately in `qa-fixes-2026-09-23.md`; a physical phone remains a separate verification gap.

Sources: [Convex Svelte authentication](https://docs.convex.dev/client/svelte/authentication), [Convex Auth setup](https://labs.convex.dev/auth/setup), [Google ID-token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

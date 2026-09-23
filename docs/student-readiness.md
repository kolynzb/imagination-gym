# Student readiness acceptance criteria

The syllabus supplies course content and sequence. Students sign in with Google and work in the app. Convex stores their progress. They do not need Obsidian or another notes app.

## Student journey

- Sign in with Google without creating a local profile or choosing a storage mode.
- Start the course, choose any valid start date, and understand what to do today.
- Read all eight weeks and open the exercise instructions inside the app.
- Time every prescribed session part, including four-part days and untimed play.
- Pause, resume, complete and log a session without losing or duplicating time.
- Navigate within the course without wrapping at its first or last day.
- Record daily learning and weekly reflections inside the app.
- Save progress automatically to Convex and restore it after signing in again.
- Leave existing browser data untouched; do not read or write progress in browser storage.
- Optionally copy or download standard Markdown notes with the correct session date and no private vault paths.
- Use the main views on mobile without horizontal page overflow.

## Account and saving

- Require verified Google sign-in before opening course controls.
- Verify Google identity on the server before accessing private progress or writing crew data.
- Restore all supported progress fields before enabling automatic cloud writes.
- Keep normal saving out of the way. Show actionable save failures and require reauthentication when a session expires.
- Do not discard pending changes on sign-out or upload them to a different account.
- Restrict room reads and writes to members, keep private notes out of leaderboards, and restrict uploaded files to their owner and room.
- Change rooms without retaining old room subscriptions.
- Never claim legacy nickname-only data based on a supplied name or email.

## Verification boundary

Automated tests, type checks, production builds and isolated browser checks must be run after integration. Real Google authentication and cross-device deployment checks require configured Google and Convex deployments; local tests alone do not prove those release steps.

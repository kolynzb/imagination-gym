# Product layout review

## Direction

Imagination Gym is a drawing practice studio built around brokendraw's eight-week course. The interface should help a returning student start their next session, help a beginner understand the course sequence, and let either find the original teaching material without losing their place. Keep the existing paper, orange, yellow, and condensed display typography. Use readable body typography for library and week-card titles. XP rewards completed practice; it does not grade artistic ability.

## Mobbin references inspected

- [Coursera learning dashboard](https://mobbin.com/screens/18683325-d982-4756-b06e-4ed52c933b06): a specific continuation action leads; supporting progress and recently viewed learning materials follow. Applied to Today and the session-first week view.
- [Skillshare category library](https://mobbin.com/screens/19988863-3136-4b9f-8432-bc0833c6564a): topical navigation, search, thumbnail cards, and instructor metadata support discovery. Applied to the Vault and more concise exercise cards.

These are hierarchy and interaction references, not replacements for the course's original resources or visual identity.

## Audit and changes

| Area | Observed problem | Implemented change |
| --- | --- | --- |
| Today | Schedule warning led the page; primary practice action lacked a clear container; references remained text links | Practice entry leads, schedule recovery follows, full-width shared resource cards sit below the session |
| This Week | Background explanations preceded sessions; letter chips did not communicate time or completion; resource formats differed | Sessions first, duration and completed-part counts, current-session marker, shared resource cards including non-video sources |
| Roadmap | Eight narrow empty vertical bars and tiny labels were difficult to scan | Responsive week cards with title, project, horizontal progress, and navigation into the week |
| Exercises | Repeated pitfalls and fixes overwhelmed browsing; action named the implementation (“drawer”) | Concise purpose/repetition cards, readable titles, “View exercise” action; full guidance remains in the accessible drawer |
| Vault | Every card mounted an embedded player; no topic filter | Thumbnail-first cards, combined topic/search filters, one selected embedded player at a time |
| Progress | Oversized square calendar cells dominated the page; XP was absent | Compact calendar, practice-level summary, two-column phone metrics; streak copy describes consecutive course days |
| Crew | Profile fields competed with the page title; blank membership state; desktop table clipped on phones | Collapsible room settings, explicit loading/empty/error messages, responsive member rows, labeled feedback input |
| Method | Long page without local navigation; date field lacked an accessible name | Section links, consistent heading scale, named date input; removed an unsupported injury claim |
| Navigation | New screens retained old scroll position; current location was visual only; mobile menu lacked keyboard containment | View scroll/focus reset, named navigation landmarks and current-page state, bounded scrollable mobile sheet, visible close control, Escape/Tab support |

## Qualitative review

| Criterion | Before (1–5) | After (1–5) | Remaining limit |
| --- | --- | --- | --- |
| Next-action clarity | 2 | 4 | Real student observation is still needed |
| Resource discoverability | 2 | 4 | External books remain page references, not uploaded copies |
| Layout consistency | 2 | 4 | Detailed practice and onboarding retain their existing specialized layouts |
| Mobile scanning | 2 | 4 | Dense reading matrices remain horizontally scrollable |
| Feedback and states | 3 | 4 | Crew needs connected service data; fixture checks cannot prove that service |

Scores are design judgments, not usability-study results. Beginner, returning-student, and narrow-screen journeys informed the changes. Existing video-led instruction, source attribution, completion, notes, timer, XP, and course content are preserved.

## Verification

- Svelte/TypeScript checks: no errors or warnings.
- Unit suite: 81 passing tests.
- Production build passes.
- Browser coverage: all eight views at 390px and 1440px; navigation from scrolled content; week-to-session discovery; combined Vault filters and one-player behavior; mobile keyboard menu; dark mode with reduced motion.
- Existing browser coverage exercises Google sign-in rendering, onboarding, practice completion, XP, timer recovery, cloud-save failures/conflicts, notes, and resource links.
- Test screenshots use simulated authentication/cloud transport and block YouTube requests. They establish layout and app behavior, not third-party playback or live persistence. Production verification is recorded separately after deployment.

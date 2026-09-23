# Day 1 teaching sample

Scope: Week 1 Day 1 only, in Today and Focus Mode. The eight-week schedule and completion data model are unchanged.

The sample adds practical warm-up steps, a ghosted-line sequence, plane instructions, optional explanations and troubleshooting, original demonstration links, pacing guidance, and a dated observational baseline. App-authored pacing and baseline additions are identified as companion suggestions. Removed the misleading instruction to lock the wrist.

Sources consulted:
- Drawabox instructor explanation of preparation and confident execution: https://drawabox.com/r/artfundamentals/post/al1hvf
- Instructor feedback on confidence, accuracy and planes: https://drawabox.com/r/artfundamentals/post/7uvodp
- Original ghosted-lines demonstration: https://www.youtube.com/watch?v=LkJG6pKTuRc
- Original ghosted-planes demonstration: https://www.youtube.com/watch?v=JsG7cMasVjo

The direct exercise text URLs returned HTTP 403 during research. The instructor's public explanations and original video listings were accessible. No Peter Han playlist has been identified as the user's intended series; none was guessed or added in this sample.

Illustration: original AI-generated three-panel teaching image, visually inspected for the intended sequence. Orange dashed marks represent pen movement above paper. This is not an instructor-authored drawing or an endorsement.

Validation: Svelte check has zero errors/warnings; production build passes; all seven practice UI browser tests pass. New regression covers keyboard disclosure activation without starting the timer, image loading, and document width at 390px. Live local browser inspection confirmed lesson rendering. Physical-phone and learner comprehension testing remain unverified.

Review question: can a learner begin, practise and inspect an attempt without reopening the lecture? The sample is ready for a real practice session before expanding to other days.

## Physical setup addition

Added a reusable DrawingSetup section before the Day 1 warm-up in Today and Focus. It covers a common tripod pen grip, paper placement, whole-arm rehearsal and light hand support. It identifies shoulder-led movement as drill-specific rather than a universal rule. Original grip and arm demonstrations load only on selection; switching, closing or collapsing unloads the player.

Read the full original https://drawabox.com/lesson/1/2 in the browser, including its grip and hover-hand sections. That page directly links https://youtu.be/_IR8zH4RCfU and https://youtu.be/0_AdsK8x9Lw. Live local rendering and selection controls were inspected; local embedded playback was not established. Seven existing practice UI regressions passed, plus a new player selection/unloading regression. The automated tests use mocked providers and do not prove YouTube playback.

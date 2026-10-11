# Practice navigation — 11 October 2026

This pass adapts the existing brokendraw curriculum rather than replacing it. Source videos, exercise descriptions, weekly links, completion keys, and saved notes remain authoritative.

## Mobbin references inspected

- [Skillshare lesson player](https://mobbin.com/screens/aa20b705-29fc-42ad-bb6d-54b31cebbf5a): video beside an ordered lesson list; project/resources separated from playback. Adapted as an interactive session sequence and expandable references inside practice.
- [MasterClass player](https://mobbin.com/screens/108736f1-f3ee-4aa6-95d7-b09ad23992ca): current video with an adjacent sequence. Supports keeping orientation visible while learning.
- [Duolingo current lesson](https://mobbin.com/screens/3ecf07e8-cea8-4414-b5d9-05cd21033429): a clear current step and explicit reward. Adapted as the next unfinished exercise, estimated duration, and completion XP on Today. No lesson locking or loss penalties were introduced.

## Behavior

The session list switches the instruction and pauses/logs an active timer. Switching or watching does not mark a part complete. Existing completion and save/retry behavior is unchanged. Completed parts remain available to review. Resource links open separately so the current practice is preserved.

## Verification boundaries

Typecheck, build, 81 unit tests, and four focused browser tests passed. Desktop/mobile screenshots were reviewed. Browser tests use simulated authentication and cloud transport, and deliberately block video requests; their blank video frames are not playback evidence. This pass does not establish live Google-account persistence, third-party video playback, or production deployment.

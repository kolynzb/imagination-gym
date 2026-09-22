# Imagination Gym 🏋️‍♂️🎨

An 8-week daily habit and training engine for drawing from imagination. Built from **brokendraw's** free drawing class, Peter Han's *The Dynamic Bible*, and Drawabox.

Designed for self-taught artists with physical sketchbooks or iPads propped on their desks.

---

## What's Inside

1. **Strict 3-Part Cadence:**
   - 🟡 **Part A: Warm-Up (10 min)** — Motor calibration, shoulder ghosting, ellipse degree control.
   - 🟠 **Part B: The Drill (45–60 min)** — Geometric medicine isolating one technical variable.
   - ⚫ **Part C: The Project (30–45 min)** — Creative synthesis stress-testing the drill.
   - ⚪ **Part D: Day 7** — The 50% Rule (pure play, zero drills, zero self-critique).
2. **Interval Countdown Timer & Web Audio Chimes:**
   - Countdown presets follow each session's curriculum, including fourth parts. Untimed play days use a stopwatch.
   - Works 100% offline via the Web Audio API.
   - Quick <kbd>Space</kbd> toggle and <kbd>1</kbd>–<kbd>9</kbd> part checklists.
3. **Slide-Over Exercise Drawer:**
   - Instant cheat sheet for all 25 exercises (reps, pitfalls, fixes) without navigating away from your active drawing session.
4. **Mobile & iPad-First Ergonomics:**
   - Sticky bottom navigation on mobile/portrait iPad so today's session is immediately visible without scrolling.
5. **Convex.dev Real-Time Crew Sync + Shared Crit Wall:**
   - Google sign-in verifies cloud membership. Room codes invite other signed-in students. Nickname-only practice stays local.
   - Live updating leaderboard ranked by hours logged.
   - Shared photo uploads for weekly group review calls.
   - Local progress and code sharing work without a cloud account after the app loads. Offline page loading is not implemented.
6. **Portable Session Notes:**
   - Copy or download today's completed session as standard Markdown. Daily and weekly notes remain first class in the app, and no external notes app or account is required.

---

## Quick Start

### 1. Run Locally
```bash
# Dependencies are already installed in the project workspace

# Start local dev server
pnpm run dev
```

### 2. Connect Convex (Optional for Live Multi-User Sync)
```bash
pnpm exec convex dev
```
Set `VITE_CONVEX_URL` in `.env.local` to your Convex deployment URL.
Set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth web client ID and authorize your frontend origin in Google Cloud.
Set `GOOGLE_CLIENT_ID` in the Convex deployment environment to the same client ID. The backend validates Google's identity tokens against this audience.

Uploads use the deployment's `.convex.site` URL. For a custom domain or local Convex backend, set `VITE_CONVEX_SITE_URL` to its HTTP action origin.
Deploy the backend and frontend together. Old clients cannot use the new authenticated write APIs.

Cloud restore keeps the previous device snapshot under **Stats & Streak > Restore Device Backup**. Recovery replaces local progress and turns off cloud sync. Export it before signing in again if you need to keep both versions. The app retains only the most recent pre-restore snapshot, not a backup history.
Concurrent device saves use a revision check. A stale device cannot replace newer cloud progress; sign in again to restore the newer copy.

Legacy rows with client-supplied `authId` values are not treated as verified accounts. They remain in the database but require an ownership-verified migration before restore. Matching an email, name, or old `authId` is not sufficient proof. Export local backups before migrating an existing deployment.

### Verify changes locally

```bash
pnpm run check
pnpm run test
pnpm run test:e2e
pnpm run build
```

Unit tests cover store behavior and Convex authorization with test identities. Browser tests cover local student flows. Before release, verify real Google sign-in, restore on another device, a concurrent-save conflict, and a crit image upload on the target deployment. These local tests do not prove production authentication.

### 3. Build for Production
```bash
pnpm run build
```
The current deploy artifact is the root `dist/` directory. It is a self-contained static web app ready to deploy to Netlify, Vercel, Cloudflare Pages, or GitHub Pages.

The legacy `site/` folder is an obsolete static prototype and is not a deploy source. Do not publish it or regenerate it.

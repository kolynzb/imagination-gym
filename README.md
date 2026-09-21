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
   - 1-click countdown presets (10m, 50m, 30m) with acoustic singing bowl / bell chime when intervals finish.
   - Works 100% offline via the Web Audio API.
   - Quick <kbd>Space</kbd> toggle and <kbd>1</kbd>–<kbd>9</kbd> part checklists.
3. **Slide-Over Exercise Drawer:**
   - Instant cheat sheet for all 25 exercises (reps, pitfalls, fixes) without navigating away from your active drawing session.
4. **Mobile & iPad-First Ergonomics:**
   - Sticky bottom navigation on mobile/portrait iPad so today's session is immediately visible without scrolling.
5. **Convex.dev Real-Time Crew Sync + Shared Crit Wall:**
   - Join a room with a Room Code + Nickname (zero password friction).
   - Live updating leaderboard ranked by hours logged.
   - Shared photo uploads for weekly group review calls.
   - 100% offline fallback to local storage and `Name: IG-W.D.H` code sharing.
6. **1-Click Obsidian Journal Exporter:**
   - Formats today's completed session directly into clean Markdown compatible with the Obsidian Vault Standard.

---

## Quick Start

### 1. Run Locally
```bash
# Install dependencies
bun install
# or: pnpm install

# Start local dev server
bun run dev
```

### 2. Connect Convex (Optional for Live Multi-User Sync)
```bash
bun x convex dev
```
Set `VITE_CONVEX_URL` in `.env.local` to your Convex deployment URL.

### 3. Build for Production
```bash
bun run build
```
The output in `dist/` is a self-contained static web app with zero runtime CDN dependencies, ready to deploy to Netlify, Vercel, Cloudflare Pages, or GitHub Pages.

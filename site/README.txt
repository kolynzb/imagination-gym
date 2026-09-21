Imagination Gym — deploy folder
Generated 2026-09-21 from "Imagination Gym.dc.html".

To publish:
  1. Go to app.netlify.com/drop (free, no account needed to test).
  2. Drag this whole "site" folder onto the page.
  3. You get a public URL immediately. Rename it in Site settings.
     (Cloudflare Pages and GitHub Pages work the same way.)

Must be served over http(s) — opening index.html by double-clicking
will fail, because curriculum.js loads as a module.

Files:
  index.html     the app (a copy of the .dc.html source)
  support.js     runtime (loads React from unpkg at first paint)
  curriculum.js  all 8 weeks of course content
  photo-slot.js  image slots, stored in the visitor's browser (IndexedDB)

Regenerate this folder after any edit to the source file.

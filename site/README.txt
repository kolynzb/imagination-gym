LEGACY NOTICE: this folder is an obsolete static prototype and is not the deploy source.
The current deploy artifact is the root dist/ directory produced by pnpm run build.

Do not publish or regenerate this folder. Use the root dist/ directory instead.

This prototype was intended to be served over http(s), but it is no longer
supported because the current app builds to root dist/.

Files:
  index.html     the app (a copy of the .dc.html source)
  support.js     runtime (loads React from unpkg at first paint)
  curriculum.js  all 8 weeks of course content
  photo-slot.js  image slots, stored in the visitor's browser (IndexedDB)

This folder is retained only as historical reference.

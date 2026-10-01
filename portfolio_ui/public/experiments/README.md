# Work gallery demos

Selected local builds from the sibling `random components` repository, packaged
under `/experiments/` so the portfolio can host them without another service.

- Keyspace: static `dist/` build; preview artwork is a capture of its actual globe.
- Koi Pond: Vite `dist/` build with its original local watercolor assets.
- No Plan Calendar: the original HTML, CSS, and JavaScript, with its animation
  clock corrected to keep day transitions stable (also applied by the sync script).
- Cherry Blossom: static `dist/` build and original local artwork.
- Little Fizz: Vite `dist/` build with root asset paths scoped to this folder.
- Rain Mouse: the existing six-second MP4 export and poster, with native playback
  controls in the expanded preview. The source composition is not modified.
- CHILL: the original 1080p, 30 fps pouring animation and poster from the sibling
  `blender-codex` project. The block frames the glass and can and plays the movie.

`embed.css` isolates each experiment's main component in `?embed=card`: the pond,
keyboard globe, blossom pool, ice puppy, or illustrated calendar. These are live,
clickable previews. Keyspace's small adapter centers the globe and starts on its
globe stage only in card mode. The complete Keyspace, Cherry Blossom, and Little
Fizz pages remain available on expansion. The pond and calendar expand to a
larger component with controls. `embed.js` forwards compact-card wheel events to
the horizontal gallery and Escape to the preview dialog.

To refresh demo builds, run `node scripts/sync-work-demos.mjs` from `portfolio_ui`.
Build updated Vite experiments in their own repository before syncing.
Pass the source repository path as the first argument when it lives elsewhere.
Pass the Blender project path as the second argument when it lives elsewhere.
Gallery thumbnail WebPs are curated captures and are retained during a sync.

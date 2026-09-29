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

`embed.css` adapts the pond and calendar to compact and expanded preview layouts.
Its poster mode hides Keyspace's surrounding text for thumbnail captures.
`embed.js` forwards Escape from a focused iframe to the surrounding preview.
All other full demo controls remain available in the expanded card.

To refresh demo builds, run `node scripts/sync-work-demos.mjs` from `portfolio_ui`.
Build updated Vite experiments in their own repository before syncing.
Pass the source repository path as the first argument when it lives elsewhere.
Gallery thumbnail WebPs are curated captures and are retained during a sync.

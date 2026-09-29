// Copy the selected, built experiments from the sibling repository.
// Run: node scripts/sync-work-demos.mjs [path-to-random-components]
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.argv[2] || path.resolve(root, '../../random components');
const target = path.join(root, 'public/experiments');
await mkdir(target, { recursive: true });
for (const name of ['keyspace', 'koi-pond', 'cherry-blossom', 'little-fizz']) {
  await cp(path.join(source, name, 'dist'), path.join(target, name), { recursive: true });
}
await mkdir(path.join(target, 'no-plan-calendar'), { recursive: true });
for (const file of ['index.html', 'style.css', 'main.js', 'dates.js']) {
  await cp(path.join(source, 'no-plan-calendar', file), path.join(target, 'no-plan-calendar', file));
}
// Keep animation deltas on the rAF clock; performance.now() can be ahead of
// a frame's timestamp, which otherwise makes the paper opening grow backwards.
const calendarFile = path.join(target, 'no-plan-calendar/main.js');
let calendar = await readFile(calendarFile, 'utf8');
calendar = calendar.replace("const dt=Math.min((time-last)/1000,.04)", "const dt=last?Math.max(0,Math.min((time-last)/1000,.04)):1/60")
  .replace("frame=0;if(phase!=='idle')wake();", "frame=phase!=='idle'?requestAnimationFrame(tick):0;")
  .replace('last=performance.now();frame=requestAnimationFrame(tick)', 'last=0;frame=requestAnimationFrame(tick)')
  .replace('opening=Math.max(0,opening-dt*5)', 'opening=Math.max(0,Math.min(1,opening-dt*5))')
  .replace('opening=Math.min(1,opening+dt*3.2)', 'opening=Math.min(1,Math.max(0,opening+dt*3.2))');
await writeFile(calendarFile, calendar);
await mkdir(path.join(target, 'rain-mouse'), { recursive: true });
await cp(path.join(source, 'rain-mouse/renders/rain-mouse.mp4'), path.join(target, 'rain-mouse/rain-mouse.mp4'));
await cp(path.join(source, 'rain-mouse/renders/verified-frame.png'), path.join(target, 'rain-mouse/poster.png'));

// Little Fizz's original build assumes a root deployment. Scope its asset URLs.
const fizzAssets = (await readdir(path.join(target, 'little-fizz/assets'))).filter(name => /\.(js|css)$/.test(name)).map(name => `assets/${name}`);
for (const file of ['index.html', ...fizzAssets]) {
  const location = path.join(target, 'little-fizz', file);
  const content = await readFile(location, 'utf8');
  await writeFile(location, content.replace(/(?<=["'(])\/(assets|fonts)\//g, '/experiments/little-fizz/$1/').replace('href="/favicon.svg"', 'href="./favicon.svg"'));
}

// The embed adapter scopes layout changes to ?embed=card; full demos keep their layout.
for (const name of ['keyspace', 'koi-pond', 'cherry-blossom', 'little-fizz', 'no-plan-calendar']) {
  const file = path.join(target, name, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html.replace('</head>', '<script src="../embed.js"></script><link rel="stylesheet" href="../embed.css"></head>');
  await writeFile(file, html);
}
console.log('Synced six showcase experiments.');

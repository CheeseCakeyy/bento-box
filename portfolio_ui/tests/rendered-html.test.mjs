import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const { default: worker } = await import("../dist/server/index.js");
async function render(path) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200, `${path} should render successfully`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton/);
  return html;
}

test("home renders the portfolio and project navigation", async () => {
  const html = await render("/");
  assert.match(html, /Adwait Tagalpallewar/);
  assert.match(html, /Explore my projects/);
  assert.match(html, /href="\/work\/?"/);
  assert.match(html, /aria-label="Theme controls"/);
});

test("projects renders both category tabs and all ML projects", async () => {
  const html = await render("/work/");
  assert.match(html, /<title>Projects — Adwait Tagalpallewar<\/title>/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="work-tab-ml"/);
  assert.match(html, /id="work-tab-web"/);
  assert.match(html, /GeoHab/);
  assert.match(html, /Folio/);
  assert.match(html, /F1/);
  assert.match(html, /Competition results/);
  // Hidden web previews must not load before the tab is selected.
  assert.doesNotMatch(html, /<iframe[^>]*src="\/experiments\//);
});

for (const path of ["/collection/", "/contact/", "/tool-kit/"]) {
  test(`${path} renders with shared navigation`, async () => {
    const html = await render(path);
    assert.match(html, /Adwait Tagalpallewar/);
    assert.match(html, /href="\/work\/?"/);
  });
}

test("all seven showcase demos have their entry assets", async () => {
  const assets = [
    "koi-pond/index.html", "keyspace/index.html", "cherry-blossom/index.html",
    "little-fizz/index.html", "no-plan-calendar/index.html",
    "chill/chill-intro-hq.mp4", "rain-mouse/rain-mouse.mp4", "embed.js", "embed.css",
  ];
  await Promise.all(assets.map((asset) => access(new URL(`../public/experiments/${asset}`, import.meta.url))));
});

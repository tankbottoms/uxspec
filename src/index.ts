/**
 * The build.
 *
 * Every page is one file: markup, CSS and script inlined, written to `dist/`.
 * There is no bundler and no asset pipeline, because there is nothing to bundle
 * -- the stylesheet is a string, the client script is a string, and the icons
 * are inline SVG. What that buys is a `dist/` a person can read.
 *
 * The build is deterministic: the sample data comes from a seeded generator over
 * a fixed epoch, and the build stamp is fixed too unless BUILT is set. Two runs
 * of an unchanged tree produce byte-identical files, so `git diff dist/` is a
 * usable review of what a change actually did to the page.
 */
import { head, nav, foot } from "./shell.ts";
import { fitSheet } from "./icons.ts";
import { CLIENT } from "./client.ts";
import { VIEWER_JS } from "./viewer.ts";
import { specBody } from "./pages/spec.ts";
import { viewerBody } from "./pages/viewer.ts";
import { pageHead, p } from "./ui.ts";

const BUILT = process.env.BUILT ?? "23 August 2026";

const U404 =
  pageHead({
    eyebrow: ["404", "no such page"],
    h1: "Not here",
    lede:
      "This site has two pages: the spec and the viewer. Whatever was linked is " +
      "neither of them, and there is no history of it having been.",
  }) +
  p(`<a href="/">The spec</a> &middot; <a href="/viewer.html">The viewer</a>`);

const DESC =
  "The house design system: badge contract, grouped rows, spark charts and wireframes, " +
  "rendered as single-file HTML by Bun with no runtime dependency.";

const meta = (title: string, path: string): string =>
  `<meta name="description" content="${DESC}">` +
  `<meta property="og:title" content="${title}">` +
  `<meta property="og:description" content="${DESC}">` +
  `<meta property="og:type" content="website">` +
  `<meta property="og:url" content="https://ux-spec.atsignhandle.workers.dev/${path}">`;

const pages: { file: string; nav: string; html: string }[] = [
  {
    file: "index.html",
    nav: "index",
    html:
      head("UX spec - the house design system", meta("UX spec", "")) +
      nav("index") +
      specBody() +
      foot(BUILT) +
      `<script>${CLIENT}</script>`,
  },
  {
    // not_found_handling = "404-page" in wrangler.toml serves this. Without it a
    // missing path returns a zero-byte body, which reads to a visitor as the site
    // being broken rather than the address being wrong.
    file: "404.html",
    nav: "index",
    html:
      head("Not found - UX spec", meta("Not found", "404.html")) +
      nav("index") +
      U404 +
      foot(BUILT) +
      `<script>${CLIENT}</script>`,
  },
  {
    file: "viewer.html",
    nav: "viewer",
    html:
      head("Viewer - the WebGL stage", meta("Viewer", "viewer.html")) +
      nav("viewer") +
      viewerBody() +
      foot(BUILT) +
      `<script>${CLIENT}</script>` +
      // The stage is the only module on the site. It is deferred by being a
      // module, so nothing here blocks the first paint of the fallback still.
      `<script type="module">${VIEWER_JS}</script>`,
  },
];

await Bun.$`mkdir -p dist/vendor`.quiet();
for (const p of pages) {
  /* The glyph sheet is cut to the page last, once the page is whole: the viewer
     uses a dozen outlines and the spec uses all of them, and shipping the whole
     sheet to both put twenty-odd kilobytes of unreferenced paths on the smaller
     one. */
  const html = fitSheet(p.html);
  await Bun.write(`dist/${p.file}`, html);
  console.log(`  dist/${p.file}  ${(html.length / 1024).toFixed(1)} KB`);
}

// Vendored three.js is copied rather than symlinked so `dist/` is a complete,
// portable artefact: a directory that can be zipped, served, or handed over.
for (const f of ["three.module.min.js", "three.core.min.js"]) {
  const src = Bun.file(`public/vendor/${f}`);
  if (await src.exists()) await Bun.write(`dist/vendor/${f}`, src);
}
console.log(`  dist/vendor/       three.js, vendored`);

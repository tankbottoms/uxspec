/** A file server whose only job is to hand back the built pages.
 *
 *  Replaces `python3 -m http.server`. Directories resolve to `index.html`,
 *  an extensionless path picks up its `.html`, and anything unknown gets the
 *  404 page the build already emitted — same shape as Workers Assets, so what
 *  you review here is what deploys. */
const port = Number(process.env.PORT ?? 8895);
const root = new URL('../dist/', import.meta.url).pathname;
const TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8', json: 'application/json',
  svg: 'image/svg+xml', png: 'image/png', woff2: 'font/woff2',
};

async function pick(path: string) {
  const clean = path.replace(/\/+$/, '');
  for (const p of [clean, `${clean}.html`, `${clean}/index.html`, '/index.html']) {
    const f = Bun.file(root + p.replace(/^\/+/, ''));
    if (await f.exists()) return f;
  }
  return null;
}

Bun.serve({
  port, hostname: '0.0.0.0',
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    // No traversal: a request is a path under dist or it is a 404, never both.
    if (path.includes('..')) return new Response('no', { status: 400 });
    const f = await pick(path);
    if (!f) {
      const nf = Bun.file(`${root}404.html`);
      return await nf.exists()
        ? new Response(nf, { status: 404, headers: { 'content-type': TYPES.html! } })
        : new Response('not found', { status: 404 });
    }
    const ext = (f.name ?? '').split('.').pop() ?? 'html';
    const type = TYPES[ext] ?? 'application/octet-stream';
    return new Response(f, { headers: { 'content-type': type } });
  },
});
console.log(`http://localhost:${port}/`);

/**
 * Parse every inline script in the built HTML.
 *
 * client.ts and viewer.ts ship as exported template literals, which means a lone
 * backslash never reaches the browser: the literal eats it. `/[",\n]/` is emitted
 * as a regex containing a real line break and `"\r\n"` as a string containing one --
 * both SyntaxErrors, and a SyntaxError kills the ENTIRE script, not the line that
 * caused it. The page still renders, every server-side feature still looks right,
 * and nothing in tsc, design-lint or badge-lint notices; the only symptom is that
 * no interactive behaviour works at all. That failure shipped once. This catches it.
 *
 * Escapes that must survive into the emitted JS are doubled at source: `\\s`, `\\n`.
 */
export {};

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("script-lint: no files given");
  process.exit(2);
}

const tp = new Bun.Transpiler({ loader: "js" });

let scripts = 0;
let bad = 0;

for (const f of files) {
  const html = await Bun.file(f).text();
  // Inline only -- a script with src= has no body to parse here.
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    if (!body.trim()) continue;
    // Data blocks are not JavaScript. A page can legitimately inline a JSON payload
    // under application/json or importmap; parsing those as JS reports a syntax
    // error for a file that is perfectly correct. Only absent/module/js types run.
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? "").toLowerCase();
    if (type && !/^(module|text\/javascript|application\/javascript|text\/ecmascript)$/.test(type)) continue;
    scripts++;
    try {
      // Transpiler, not `new Function`: viewer.html ships a `type="module"` script,
      // and `new Function` cannot parse `import`. This parses both kinds.
      tp.transformSync(body);
    } catch (e) {
      bad++;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`${f}  ERROR inline script does not parse: ${msg}`);
      // A regex or string literal broken by the template literal is the usual cause,
      // so point at the escapes rather than making the reader rediscover it.
      console.error(`    check for single-backslash escapes in the source template literal`);
    }
  }
}

if (bad > 0) {
  console.error(`${bad} of ${scripts} inline scripts fail to parse.`);
  process.exit(1);
}
console.log(`script contract: ok (${scripts} inline scripts parse)`);

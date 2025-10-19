// scripts/inject-home-redirect.cjs
// Robustly injects <base href="/Listana/"> into dist/index.html <head>
// Ensures asset paths work on GitHub Pages under /Listana/
// Idempotent: if already present, it skips.

const fs = require('fs');
const path = require('path');

const DIST = path.join(process.cwd(), 'dist');
const INDEX = path.join(DIST, 'index.html');

function main() {
  if (!fs.existsSync(INDEX)) {
    console.error('[inject-base] dist/index.html not found. Did you export first?');
    process.exit(0);
  }

  let html = fs.readFileSync(INDEX, 'utf8');

  // Skip if base already present
  if (html.includes('<base href="/Listana/">')) {
    console.log('[inject-base] already injected. Skipping.');
    return;
  }

  // Insert right after <head ...> (handles cases where <head> is inline/packed)
  html = html.replace(/<head[^>]*>/, match => `${match}\n  <base href="/Listana/">`);

  fs.writeFileSync(INDEX, html, 'utf8');
  console.log('[inject-base] <base href="/Listana/"> injected successfully');
}

main();
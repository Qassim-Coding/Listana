// scripts/fix-public-paths.cjs
// Rewrites absolute asset URLs in dist/*.html so they work under /Listana/ on GitHub Pages.
// Idempotent: running multiple times leaves files unchanged once patched.

const fs = require('fs');
const path = require('path');

const DIST = path.join(process.cwd(), 'dist');
const PUBLIC_PREFIX = '/Listana';
const TARGET_EXT = '.html';
const STATIC_DIRS = ['_expo', 'assets'];
const HASH_SNIPPET_ID = 'gh-pages-hash-redirect';

function rewriteHtml(html, fileName) {
  let updated = html;

  STATIC_DIRS.forEach((dir) => {
    const pattern = new RegExp(`(=)(["'])\\/${dir}\\/`, 'g');
    updated = updated.replace(pattern, (_, eq, quote) => `${eq}${quote}${PUBLIC_PREFIX}/${dir}/`);
  });

  updated = updated.replace(/(=)(["'])\/favicon\.ico/g, (_, eq, quote) => `${eq}${quote}${PUBLIC_PREFIX}/favicon.ico`);

  if (fileName === 'index.html' && !updated.includes(HASH_SNIPPET_ID)) {
    // Force le chemin complet /Listana/#/ pour éviter la redirection vers la racine
    const snippet = `<script id="${HASH_SNIPPET_ID}">(function(){if(!location.hash||location.hash==="#"){location.replace("${PUBLIC_PREFIX}/#/");}})();</script>`;
    updated = updated.replace('</head>', `${snippet}</head>`);
  }

  return updated;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[fix-public-path] dist/ directory not found. Did you export first?');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST).filter((file) => path.extname(file) === TARGET_EXT);
  if (files.length === 0) {
    console.warn('[fix-public-path] No HTML files found in dist/. Nothing to do.');
    return;
  }

  let patchedCount = 0;

  for (const file of files) {
    const fullPath = path.join(DIST, file);
    const original = fs.readFileSync(fullPath, 'utf8');
    const rewritten = rewriteHtml(original, file);

    if (rewritten !== original) {
      fs.writeFileSync(fullPath, rewritten, 'utf8');
      patchedCount += 1;
    }
  }

  if (patchedCount === 0) {
    console.log('[fix-public-path] HTML already references prefixed assets. Skipping.');
  } else {
    console.log(`[fix-public-path] Updated asset URLs in ${patchedCount} HTML file(s).`);
  }
}

main();

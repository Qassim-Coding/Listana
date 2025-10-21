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

  // Injecter le script dans TOUS les fichiers HTML, pas juste index.html
  if (!updated.includes(HASH_SNIPPET_ID)) {
    // Force le chemin complet /Listana/#/ ET empêche Expo Router de modifier l'URL
    const snippet = `<script id="${HASH_SNIPPET_ID}">
(function(){
  // Force le hash initial si on est sur une page directe
  const path = window.location.pathname.replace("${PUBLIC_PREFIX}", "").replace(/\\.html$/, "");
  if(!location.hash || location.hash==="#"){
    if(path && path !== "/" && path !== ""){
      location.replace("${PUBLIC_PREFIX}/#" + path);
    } else {
      location.replace("${PUBLIC_PREFIX}/#/");
    }
  }
  // Intercepte les changements d'URL pour garder /Listana/ dans le path
  if(typeof window !== 'undefined' && window.history){
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(state, title, url) {
      if(url && !url.startsWith("${PUBLIC_PREFIX}") && url.startsWith("/")){
        url = "${PUBLIC_PREFIX}" + url;
      }
      return originalPushState.call(this, state, title, url);
    };
    
    window.history.replaceState = function(state, title, url) {
      if(url && !url.startsWith("${PUBLIC_PREFIX}") && url.startsWith("/")){
        url = "${PUBLIC_PREFIX}" + url;
      }
      return originalReplaceState.call(this, state, title, url);
    };
  }
})();
</script>`;
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

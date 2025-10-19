// Inject base href and redirect script into dist/index.html for GitHub Pages compatibility
// Ensures correct asset paths and hash routing
// Safe to re-run: uses a marker to avoid duplicate injection

const fs = require('fs');
const path = require('path');

const DIST = path.join(process.cwd(), 'dist');
const INDEX = path.join(DIST, 'index.html');
const MARKER = '<!-- REDIRECT_HOME_INJECT -->';

function main() {
  if (!fs.existsSync(INDEX)) {
    console.error('[inject-home-redirect] dist/index.html not found. Did you export?');
    process.exit(0); // non-fatal
  }

  let html = fs.readFileSync(INDEX, 'utf8');
  if (html.includes(MARKER)) {
    console.log('[inject-home-redirect] already injected. Skipping.');
    return;
  }

  const snippet = [
    MARKER,
    '<base href="/Listana/">',
    '<script>(function(){try{',
    'var h=location.hash; if(!h||h==="#"){',
    ' var base=location.pathname.replace(/index\\.html$/, "");',
    ' var q=location.search||"";',
    ' location.replace(base+"#/"+q);',
    '}',
    '}catch(e){}})();</script>'
  ].join('\n');

  // Prefer to inject before </head>, else before </body>, else append
  if (html.includes('</head>')) {
    html = html.replace('</head>', snippet + '\n</head>');
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', snippet + '\n</body>');
  } else {
    html += '\n' + snippet + '\n';
  }

  fs.writeFileSync(INDEX, html);
  console.log('[inject-home-redirect] injected into dist/index.html');
}

main();
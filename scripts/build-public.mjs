import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('js/', output), { recursive: true });
await mkdir(new URL('styles/', output), { recursive: true });
// The browser-only editor is not a deployed administration service.
for (const path of [
  'index.html', 'article.html', 'article-02.html', 'article-03.html', 'article-04.html',
  'assets', '.well-known', 'security.txt', 'robots.txt',
  'styles/main.css', 'js/app.js', 'js/cms.js', 'js/translator.js'
]) await cp(new URL(path, root), new URL(path, output), { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built public site: ${fileURLToPath(output)}`);

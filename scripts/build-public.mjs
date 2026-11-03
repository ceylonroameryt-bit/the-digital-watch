import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('js/', output), { recursive: true });
await mkdir(new URL('styles/', output), { recursive: true });
// The browser-only editor is not a deployed administration service.
for (const path of [
  'index.html', 'article.html', 'article-02.html', 'article-03.html', 'article-04.html', 'article-05.html', 'article-06.html', 'article-07.html', 'article-08.html', 'article-09.html', 'article-10.html',
  'behind-the-breach-01.html', 'behind-the-breach-02.html', 'behind-the-breach-03.html', 'behind-the-breach-04.html', 'series.html', 'tool-spotlight-04.html', 'tool-spotlight-03.html', 'tool-spotlight-02.html', 'tool-spotlight-01.html', 'myth-vs-reality-10.html', 'myth-vs-reality-09.html', 'myth-vs-reality-08.html', 'myth-vs-reality-07.html', 'myth-vs-reality-06.html', 'myth-vs-reality-05.html', 'myth-vs-reality-04.html', 'myth-vs-reality-03.html', 'myth-vs-reality-02.html', 'myth-vs-reality-01.html', 'playbook-monday-10.html', 'playbook-monday-09.html', 'playbook-monday-08.html', 'playbook-monday-07.html', 'playbook-monday-06.html', 'playbook-monday-05.html', 'playbook-monday-04.html', 'playbook-monday-03.html', 'playbook-monday-02.html', 'playbook-monday-01.html', 'threat-of-the-week-10.html', 'threat-of-the-week-09.html', 'threat-of-the-week-08.html', 'threat-of-the-week-07.html', 'threat-of-the-week-06.html', 'threat-of-the-week-05.html', 'threat-of-the-week-04.html', 'threat-of-the-week-03.html', 'threat-of-the-week-02.html', 'threat-of-the-week-01.html', 'security-in-5-minutes-10.html', 'security-in-5-minutes-09.html', 'security-in-5-minutes-08.html', 'security-in-5-minutes-07.html', 'security-in-5-minutes-06.html', 'security-in-5-minutes-05.html', 'security-in-5-minutes-04.html', 'security-in-5-minutes-03.html', 'security-in-5-minutes-02.html', 'security-in-5-minutes-01.html', 'ep1-ai-deepfakes.html', 'ep2-identity-recon.html', 'ep3-triage-playbook.html',
  'CNAME', 'assets', '.well-known', 'security.txt', 'robots.txt', 'sitemap.xml',
  'styles/main.css', 'styles/modern.css', 'js/app.js', 'js/cms.js', 'js/translator.js', 'js/three.min.js', 'js/iso-scenes.js'
]) await cp(new URL(path, root), new URL(path, output), { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built public site: ${fileURLToPath(output)}`);

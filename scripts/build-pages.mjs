import { pagesBasePath, demoBasePath } from './pages-config.mjs';
import { cp, mkdir, rm, stat, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(process.cwd());
const showcase = join(root, 'showcase/site');
const support = join(root, 'service-desk/pages-dist');
const output = join(root, 'dist');

for (const path of [join(showcase, 'index.html'), join(support, 'index.html')]) {
  const file = await stat(path).catch(() => null);
  if (!file?.isFile()) throw new Error('Required demo missing: ' + path);
}
const html = await readFile(join(support, 'index.html'), 'utf8');
if (!html.includes(demoBasePath + '/')) {
  throw new Error('Support demo built without expected GitHub Pages base path');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(showcase, output, { recursive: true });
await mkdir(join(output, 'demo'), { recursive: true });
await cp(support, join(output, 'demo'), { recursive: true });
// Pages resolves every deep-link miss through the root 404 document.
// Demo assets use absolute base paths, so the URL and query can stay intact.
await writeFile(join(output, '404.html'), html.replace('<head>', `<head>
  <script>if (!location.pathname.startsWith('${demoBasePath}/')) location.replace('${pagesBasePath}/' + location.search + location.hash);</script>`));
console.log('Unified Jup Resolve Pages build complete');

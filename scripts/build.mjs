import { demoBasePath } from './pages-config.mjs';
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['scripts/build-pages.mjs'], {
  cwd: new URL('../service-desk/', import.meta.url),
  env: { ...process.env, JUP_PAGES_BASE_PATH: demoBasePath },
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);
await import('./build-pages.mjs');

const audit = spawnSync(process.execPath, ['scripts/privacy-scan.mjs', 'dist'], { stdio: 'inherit' });
if (audit.status !== 0) process.exit(audit.status ?? 1);

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const sha = execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
if (process.env.REVIEW_SHA && sha !== process.env.REVIEW_SHA) throw new Error('Checkout does not match reviewed revision');
await mkdir('artifacts', { recursive: true });
const report = await readFile('docs/RELEASE_VALIDATION.md', 'utf8');
await writeFile('artifacts/RELEASE_VALIDATION.md', report + '\n## Revisão exata executada pelo CI\n\nSHA de destino: `' + sha + '`\n');
await writeFile('artifacts/release-revision.json', JSON.stringify({ reviewedSHA: sha, repository: process.env.GITHUB_REPOSITORY ?? 'borgescodes/jup-resolve-pages', event: process.env.GITHUB_EVENT_NAME ?? 'local' }, null, 2));

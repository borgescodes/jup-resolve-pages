import { readdir, readFile, stat, realpath } from 'node:fs/promises';
import { extname, join, relative, resolve, isAbsolute, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspectPrivacyText } from './privacy-rules.mjs';
const root = resolve(process.cwd());
const args = process.argv.slice(2);
const denyIndex = args.indexOf('--denylist');
let denylist = [];
if (denyIndex >= 0) {
  const external = resolve(args[denyIndex + 1] ?? '');
  const outside = candidate => { const relation = relative(root, candidate); return relation === '..' || relation.startsWith('..' + sep) || isAbsolute(relation); };
  const canonicalRoot = await realpath(root);
  const canonicalExternal = await realpath(external);
  const canonicalRelation = relative(canonicalRoot, canonicalExternal);
  const canonicalOutside = canonicalRelation === '..' || canonicalRelation.startsWith('..' + sep) || isAbsolute(canonicalRelation);
  if (!outside(external) || !canonicalOutside) throw new Error('Private denylist must be outside the repository');
  denylist = JSON.parse(await readFile(external, 'utf8'));
  if (!Array.isArray(denylist) || !denylist.every(term => typeof term === 'string' && term.length > 0)) throw new Error('Invalid external denylist');
  args.splice(denyIndex, 2);
}
const tracked = args.includes('--tracked');
const paths = args.filter(value => value !== '--tracked');
if (tracked) paths.push(...execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z']).toString().split('\0').filter(Boolean));
if (!paths.length) throw new Error('Provide audit paths or --tracked');
const extensions = new Set(['.html','.css','.js','.mjs','.json','.jsonl','.svg','.md','.txt','.yml','.yaml','.toml','.csv','.py','.sql','.ps1','.cmd','.ini']);
const skip = new Set(['.git', 'node_modules']);
const visited = new Set();
const findings = {};
let scanned = 0;
function record(reason) { findings[reason] = (findings[reason] ?? 0) + 1; }
async function audit(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const info = await stat(path).catch(() => null);
  if (!info) { if (tracked) return; throw new Error('Missing audit input'); }
  const name = relative(root, path).replaceAll('\\', '/');
  if (/(?:^|\/)(?:\.source|\.env(?:\..*)?|__pycache__|id_rsa|id_ed25519)(?:\/|$)|\.(?:pem|p12|pfx|pyc|sqlite|db|sql|py)$/i.test(name)) record('private-file');
  if (info.isDirectory()) {
    for (const entry of await readdir(path, { withFileTypes: true })) if (!skip.has(entry.name)) await audit(join(path, entry.name));
    return;
  }
  if (!extensions.has(extname(path).toLowerCase())) return;
  scanned++;
  for (const reason of inspectPrivacyText(await readFile(path, 'utf8'), { path: name, denylist })) record(reason);
}
for (const path of paths) await audit(resolve(root, path));
const report = { status: Object.keys(findings).length ? 'FAIL' : 'PASS', scannedTextFiles: scanned, privateDenylist: denylist.length > 0, findings };
console.log(JSON.stringify(report)); // No matched content or private terms are logged.
if (report.status === 'FAIL') process.exitCode = 1;

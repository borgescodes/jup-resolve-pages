import { readdir, readFile } from 'node:fs/promises';

const root = new URL('../src/', import.meta.url);
const allowedExternalUrls = new Set(['https://support.microsoft.com/en-us/accounts-billing/work-school/change-your-work-or-school-account-password']);
const forbidden = [
  'backdrop-filter',
  'linear-gradient(',
  'radial-gradient(',
  'RoutingRegistry',
  'ApprovalService',
  'ExecutionEngine',
  'POLICY_DECISIONS',
  '/api/v1/access',
  'Authorization: Bearer',
  'http://127.0.0.1:',
  'http://localhost:',
  'https://cdn.',
];

async function files(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const target = new URL(entry.name, dirUrl);
    if (entry.isDirectory()) result.push(...(await files(new URL(`${entry.name}/`, dirUrl))));
    else result.push(target);
  }
  return result;
}

let failed = false;
for (const file of await files(root)) {
  if (/\/(?:OFL\.txt|Oxanium-OFL\.txt|Oxanium-ATTRIBUTION\.md)$/.test(file.pathname)) continue;
  if (file.pathname.endsWith('.woff2')) {
    const bytes = await readFile(file);
    if (bytes.subarray(0, 4).toString() !== 'wOF2') { console.error('Invalid WOFF2 font'); failed = true; }
    continue;
  }
  if (file.pathname.endsWith('.png')) {
    const bytes = await readFile(file);
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      console.error(`Invalid PNG asset in ${file.pathname}`); failed = true;
    }
    continue;
  }
  if (file.pathname.endsWith('.gif')) {
    const bytes = await readFile(file);
    const signature = bytes.subarray(0, 6).toString('ascii');
    if (signature !== 'GIF87a' && signature !== 'GIF89a') {
      console.error(`Invalid GIF asset in ${file.pathname}`); failed = true;
    }
    continue;
  }
  let text = await readFile(file, 'utf8');
  if (file.pathname.endsWith('.svg')) {
    text = text.replace(/xmlns(?::xlink)?="http:\/\/www\.w3\.org\/(?:2000\/svg|1999\/xlink)"/g, '');
    if (/<script|\son\w+=|<foreignObject/i.test(text)) { console.error('Unsafe SVG asset'); failed = true; }
  }
  for (const token of forbidden) {
    if (text.includes(token)) {
      console.error(`Forbidden frontend token ${JSON.stringify(token)} in ${file.pathname}`);
      failed = true;
    }
  }
  const externalUrls = text.match(/https?:\/\/[^\s'"`<>]+/g) ?? [];
  for (const url of externalUrls) {
    if (!allowedExternalUrls.has(url)) {
      console.error(`External URL ${JSON.stringify(url)} is not allowed in ${file.pathname}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log('frontend lint ok');

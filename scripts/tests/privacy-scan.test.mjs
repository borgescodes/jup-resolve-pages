import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectPrivacyText, normalizePrivacyText } from '../privacy-rules.mjs';
async function scan(content, options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'synthetic-privacy-'));
  try {
    const input = join(dir, 'fixture.html');
    await writeFile(input, content);
    const args = ['scripts/privacy-scan.mjs', input];
    if (options.denylist) { const list = join(dir, 'deny.json'); await writeFile(list, JSON.stringify(options.denylist)); args.push('--denylist', list); }
    return spawnSync(process.execPath, args, { encoding: 'utf8' });
  } finally { await rm(dir, { recursive: true, force: true }); }
}
test('normal library APIs and synthetic emails pass', async () => {
  assert.equal((await scan('value.substring(2); licensed font subsets; user@example.invalid')).status, 0);
});
test('external fictitious tokens block plain, accented, split, encoded and invisible bypasses', async () => {
  for (const content of ['fictional-zeta', 'fíctional-zeta', 'f%C3%ADctional-zeta', "'fictional-' + 'zeta'", "'fictional-' + \"zeta\"", "'fictional-' /* fictitious */ + /* fixture */ 'zeta'", 'fictional-\\u007aeta', 'fictional-%7aeta', 'fictional-&#122;eta', 'fictional-\u200bzeta']) {
    const result = await scan(content, { denylist: ['fictional-zeta'] });
    assert.equal(result.status, 1);
    assert.ok(!result.stdout.includes('fictional-zeta'));
  }
});
test('operational addresses, private source references and credentials are blocked', async () => {
  for (const text of ['http://localhost:8000', 'http://127.0.0.1:8000', 'person@fictional.test', 'https://portal.fictional.test', ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' '), ['gh', 'p_', 'a'.repeat(36)].join(''), ['https:', '//github.com/', 'fictitious/private-demo'].join('')]) {
    assert.equal((await scan(text)).status, 1);
  }
});
test('normalization is stable and short denylist terms require boundaries', () => {
  assert.equal(normalizePrivacyText('ZÉTA\\u002d&#88;%59'), 'zeta-xy');
  assert.deepEqual(inspectPrivacyText('substring', { denylist: ['xyz'] }), []);
  assert.deepEqual(inspectPrivacyText('key-qzx_access', { denylist: ['qzx'] }), ['private-denylist']);
});
test('generic CLI blocks private files without printing their contents', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'synthetic-private-file-'));
  try {
    await writeFile(join(dir, '.env'), 'EXAMPLE=fictional');
    const result = spawnSync(process.execPath, ['scripts/privacy-scan.mjs', dir], { encoding: 'utf8' });
    assert.equal(result.status, 1); assert.ok(!result.stdout.includes('fictional'));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('denylist cannot use a dot-prefixed repository directory to appear external', async () => {
  const dir = await mkdtemp(join(process.cwd(), '..synthetic-list-'));
  try {
    const list = join(dir, 'list.json'); await writeFile(list, JSON.stringify(['fictional-zeta']));
    const input = join(dir, 'fixture.html'); await writeFile(input, 'safe');
    const result = spawnSync(process.execPath, ['scripts/privacy-scan.mjs', input, '--denylist', list], { encoding: 'utf8' });
    assert.equal(result.status, 1); assert.match(result.stderr, /must be outside/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

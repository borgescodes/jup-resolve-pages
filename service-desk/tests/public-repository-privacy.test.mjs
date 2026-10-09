import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('tracked public files pass generic privacy checks', () => {
  const result = spawnSync(process.execPath, ['scripts/privacy-scan.mjs', '--tracked'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout);
});
test('bundled brand directory contains only declared demo assets', () => {
  assert.deepEqual(readdirSync(new URL('../src/assets/brand/', import.meta.url)).sort(), ['jup-avatar-main.gif', 'jup-ico.png', 'jup-resolve-logo.svg', 'jup-tagline.svg']);
});

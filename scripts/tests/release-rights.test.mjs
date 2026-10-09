import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const text = path => readFile(new URL('../../' + path, import.meta.url), 'utf8');

test('MIT applies only to original code and excludes brand assets', async () => {
  const license = await text('LICENSE');
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2026 Borgescodes/);
  assert.match(license, /Permission is hereby granted, free of charge/);
  assert.match(license, /only to original source code/);
  assert.match(license, /do not license the Jup Resolve name/);
  assert.match(license, /docs\/ASSET_RIGHTS\.md/);
});

test('reserved visual assets have a clear publication-only declaration', async () => {
  const notice = await text('docs/ASSET_RIGHTS.md');
  const licenses = await text('docs/LICENSES.md');
  const readme = await text('README.md');
  for (const term of ['jup-avatar-main.gif', 'jup-no-face.png', 'jup-cover-avatar.webp', 'laptop.png', 'docs/evidence/']) {
    assert.ok(notice.includes(term), 'Missing reserved asset description: ' + term);
  }
  assert.match(notice, /2026-10-09/);
  assert.match(notice, /nao constitui comprovacao documental independente/);
  assert.match(licenses, /MIT para código e documentação autorais/);
  assert.match(readme, /direitos reservados/);
});

test('assets and third-party licensing remain independent of MIT project code', async () => {
  const notice = await text('docs/ASSET_RIGHTS.md');
  const licenses = await text('docs/LICENSES.md');
  assert.match(notice, /Oxanium, Montserrat, Inter e JetBrains Mono/);
  assert.match(licenses, /SIL OFL 1\.1/);
  assert.match(licenses, /GSAP 3\.15\.0/);
  for (const path of [
    'service-desk/src/assets/brand/jup-avatar-main.gif',
    'service-desk/src/assets/jup/jup-no-face.png',
    'showcase/site/assets/avatar/jup-cover-avatar.webp',
    'showcase/site/assets/scene-05/laptop.png',
    'showcase/site/jup-ico.png',
  ]) assert.equal((await stat(new URL('../../' + path, import.meta.url))).isFile(), true);
});

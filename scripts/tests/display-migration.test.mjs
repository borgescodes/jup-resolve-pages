import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
test('architecture link is direct and modal markup, styles and behavior are absent', async () => {
  const html = await readFile('showcase/site/index.html', 'utf8');
  const css = await readFile('showcase/site/styles.css', 'utf8');
  const js = await readFile('showcase/site/presentation.js', 'utf8');
  assert.match(html, /class="v2-architecture-link[^>]+href="architecture\/jup-resolve-runtime-architecture.html"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  assert.doesNotMatch(html + css + js, /architectureModal|modal-backdrop|modal-dialog|modal-scrim|data-modal|modalOpen|openModal|closeModal|architecture-preview/);
});
test('public display fonts and outlines originate from Oxanium with a separate license', async () => {
  for (const dir of ['service-desk/src/assets/fonts', 'showcase/site/assets/fonts']) {
    const bytes = await readFile(join(dir, 'OxaniumVariable.woff2'));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
    assert.match(await readFile(join(dir, 'Oxanium-OFL.txt'), 'utf8'), /Oxanium Project Authors/);
    assert.match(await readFile(join(dir, 'Oxanium-OFL.txt'), 'utf8'), /SIL Open Font License, Version 1.1/);
    assert.ok((await readdir(dir)).filter(name => /\.woff2$/.test(name)).every(name => /^(?:OxaniumVariable|InterVariable)\.woff2$/.test(name)));
  }
  for (const dir of ['showcase/site/assets/titles', 'showcase/site/assets/brand', 'service-desk/src/assets/brand']) {
    for (const file of await readdir(dir)) {
      if (!file.endsWith('.svg')) continue;
      const svg = await readFile(join(dir, file), 'utf8');
      assert.match(svg, /data-source-font="Oxanium"/);
      assert.match(svg, /data-font-weight="800"/);
      assert.doesNotMatch(svg, /data:image/);
    }
  }
  for (const file of ['service-desk/src/tokens.css', 'service-desk/src/styles.css', 'showcase/site/styles.css', 'showcase/site/index.html']) {
    assert.match(await readFile(file, 'utf8'), /Oxanium/i);
  }
});

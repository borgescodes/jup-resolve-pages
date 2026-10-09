const test = require('node:test');
const assert = require('node:assert/strict');

const {
  computeContainedScale,
  deriveScene05State,
  nextScene05Mode,
  allowLocalScene05Runtime,
} = require('../site/presentation.js');

test('computeContainedScale preserves the 1440x900 desktop viewport without cropping', () => {
  assert.equal(computeContainedScale(720, 450), 0.5);
  assert.equal(computeContainedScale(900, 450), 0.5);
  assert.equal(computeContainedScale(720, 400), 4 / 9);
});

test('deriveScene05State requests the first load while keeping fallback visible until the iframe is ready', () => {
  assert.deepEqual(
    deriveScene05State({ active: true, mode: 'live', loaded: false }),
    { loaded: true, visible: false, interactive: false, tabIndex: -1 },
  );

  // Removing `loaded || active` would destroy the preserved-instance contract here.
  assert.deepEqual(
    deriveScene05State({ active: false, mode: 'live', loaded: true }),
    { loaded: true, visible: false, interactive: false, tabIndex: -1 },
  );
});

test('deriveScene05State switches to fallback without destroying the loaded iframe', () => {
  assert.deepEqual(
    deriveScene05State({ active: true, mode: 'fallback', loaded: true }),
    { loaded: true, visible: false, interactive: false, tabIndex: -1 },
  );
});

test('nextScene05Mode only handles the discreet L shortcut while scene 05 is active', () => {
  assert.equal(nextScene05Mode('live', 'l', true), 'fallback');
  assert.equal(nextScene05Mode('fallback', 'L', true), 'live');
  assert.equal(nextScene05Mode('live', 'l', false), 'live');
  assert.equal(nextScene05Mode('live', 'ArrowRight', true), 'live');
});

test('public showcase has no employer branding or corporate identifiers', () => {
  const { readFileSync, readdirSync, existsSync } = require('node:fs');
  const { join } = require('node:path');
  const root = join(__dirname, '..', 'site');
  const inspect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (/\.(?:html|css|js|mjs|svg|json|txt|md)$/i.test(entry.name)) {
        const content = readFileSync(path, 'utf8');
        assert.ok(!/data:image\/(?:png|jpeg).*base64,/i.test(content));
      }
    }
  };
  inspect(root);
  assert.ok(readdirSync(join(root, 'assets/brand')).every(file => /^jup-|^brand-|^logo-/.test(file)));
  assert.equal(existsSync(join(root, 'assets/integrations/sap.svg')), false);
  const index = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(index, /Sistema ERP fictício/);
  assert.match(index, /Créditos da apresentação/);
});

test('presentation fallback and architecture cannot ship embedded company screenshots', () => {
  const { readFileSync, existsSync } = require('node:fs');
  const { join } = require('node:path');
  const root = join(__dirname, '..', 'site');
  const index = readFileSync(join(root, 'index.html'), 'utf8');
  const architecture = readFileSync(join(root, 'architecture/jup-resolve-runtime-architecture.html'), 'utf8');
  assert.match(index, /scene05-fallback__content/);
  assert.match(index, /portal de serviços/i);
  assert.match(index, /href="architecture\/jup-resolve-runtime-architecture.html"/);
  assert.doesNotMatch(index, /id="architectureModal"/);
  assert.doesNotMatch(index, /fictional-zeta-private/);
  assert.doesNotMatch(architecture, /fictional-zeta-private/);
  assert.match(architecture, /API fictícia/);
  assert.equal(existsSync(join(root, 'assets/scene-05/fallback.png')), false);
  assert.equal(existsSync(join(root, 'assets/architecture/scene5-architecture.webp')), false);
});

test('published presentation embeds only the same-origin static demo on any host', () => {
  assert.equal(allowLocalScene05Runtime('borgescodes.github.io'), true);
  assert.equal(allowLocalScene05Runtime('demo.example.com'), true);
  assert.equal(allowLocalScene05Runtime('localhost'), true);
  assert.equal(allowLocalScene05Runtime('127.0.0.1'), true);
  assert.equal(allowLocalScene05Runtime(''), true);
});

test('all animated requester needs use fictitious organizations and generic systems', () => {
  const { readFileSync } = require('node:fs');
  const { join } = require('node:path');
  const root = join(__dirname, '..', 'site');
  const script = readFileSync(join(root, 'presentation.js'), 'utf8');
  const architecture = readFileSync(join(root, 'architecture/jup-resolve-runtime-architecture.html'), 'utf8');
  const forbidden = /fictional-zeta|private-example/i;
  assert.doesNotMatch(script, forbidden);
  assert.doesNotMatch(architecture, forbidden);
  assert.match(script, /CRM de demonstração/);
  assert.match(script, /ERP fictício/);
});

test('standalone architecture does not publish links to historical unsanitized source revisions', () => {
  const { readFileSync } = require('node:fs');
  const { join } = require('node:path');
  const html = readFileSync(join(__dirname, '..', 'site/architecture/jup-resolve-runtime-architecture.html'), 'utf8');
  const match = html.match(/<script id="archify-source-evidence-data" type="application\/json">([^<]+)<\/script>/);
  assert.ok(match);
  const evidence = JSON.parse(match[1]);
  assert.equal(evidence.verified, false);
  assert.equal(evidence.repository, null);
  assert.deepEqual(evidence.nodes, {});
  assert.doesNotMatch(html, /fictional-zeta-private/);
});

import { pagesBasePath } from './pages-config.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, readdir, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, join } from 'node:path';
import { chromium } from 'playwright';

const base = pagesBasePath;
const root = resolve('dist');
const artifacts = resolve('artifacts');
await mkdir(artifacts, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local.test').pathname);
    if (!pathname.startsWith(base + '/')) { res.writeHead(404); res.end(); return; }
    let file = resolve(root, '.' + pathname.slice(base.length));
    if (!file.startsWith(root + '/') && !file.startsWith(root + '\\') && file !== root) throw new Error('Invalid path');
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    let status = 200;
    if (!(await stat(file).catch(() => null))?.isFile()) { file = join(root, '404.html'); status = 404; }
    res.writeHead(status, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const report = { httpAssets: 0, scenes: [], routes: [], errors: [], backendRequests: [], failedResources: [], unexpectedRequests: [], screenshots: [] };
let browser;
try {
  async function auditAssets(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      const relative = prefix + entry.name;
      if (entry.isDirectory()) await auditAssets(path, relative + '/');
      else { assert.equal((await fetch(origin + base + '/' + relative)).status, 200, relative); report.httpAssets++; }
    }
  }
  await auditAssets(root);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  context.on('page', page => {
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('request', req => {
      const url = new URL(req.url());
      if (/(?:^|\/)(?:api|rest|rpc)(?:\/|$)/.test(url.pathname)) report.backendRequests.push(req.url());
      if (['fetch', 'xhr'].includes(req.resourceType()) &&
          !(req.method() === 'GET' && url.origin === origin && url.pathname === base + '/demo/')) report.backendRequests.push(req.url());
      if (!['data:', 'blob:', 'about:'].includes(url.protocol) &&
          !(url.origin === origin && url.pathname.startsWith(base + '/')) &&
          !['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.boxicons.com'].includes(url.hostname)) report.unexpectedRequests.push(req.url());
    });
    page.on('requestfailed', req => report.failedResources.push(req.url() + ': ' + req.failure()?.errorText));
    page.on('response', res => { if (res.status() >= 400 && /\.(?:css|mjs|js|png|svg|webp|woff2)(?:\?|$)/.test(res.url())) report.failedResources.push(res.url()); });
  });
  const page = await context.newPage();
  async function shot(name) { await page.screenshot({ path: join(artifacts, name + '.png'), fullPage: true }); report.screenshots.push(name + '.png'); }
  await page.goto(origin + base + '/');
  await page.locator('#scene-1.is-active').waitFor();
  await shot('showcase-desktop');
  const sceneCount = await page.locator('[data-scene]').count();
  for (let scene = 1; scene <= sceneCount; scene++) {
    await page.locator(`#scene-${scene}.is-active`).waitFor();
    report.scenes.push(scene);
    if (scene === 5) {
      const iframe = page.frameLocator('[data-scene05-frame]');
      await iframe.locator('#faq-search').waitFor();
      await page.locator('[data-scene05-demo].is-live-visible').waitFor();
      assert.equal(await page.locator('.scene05-public-link').getAttribute('href'), './demo/');
      await shot('showcase-embedded-demo');
    }
    if (scene === 6) {
      assert.equal(await page.locator('#architectureModal, .modal-backdrop, [data-modal-open]').count(), 0);
      const link = page.locator('.v2-architecture-link');
      assert.equal(await link.getAttribute('target'), '_blank');
      assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
      const popupPromise = context.waitForEvent('page');
      await link.click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), origin + base + '/architecture/jup-resolve-runtime-architecture.html');
      await popup.locator('svg').first().waitFor();
      await popup.close();
      await shot('architecture-direct-link');
    }
    await shot('showcase-scene-' + scene + '-1440');
    if (scene < sceneCount) await page.keyboard.press('ArrowRight');
  }
  await page.goto(origin + base + '/architecture/jup-resolve-runtime-architecture.html');
  await page.locator('svg').first().waitFor();
  await shot('architecture-detail');
  await page.goto(origin + base + '/demo/');
  await page.locator('#faq-search').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const oxaniumLoaded = await page.evaluate(async () => {
    await document.fonts.load('800 40px Oxanium', 'Aprovação çãõáéíóú');
    return [...document.fonts].some(font => font.family === 'Oxanium' && font.status === 'loaded');
  });
  assert.equal(oxaniumLoaded, true);
  assert.equal(await page.locator('.brand-wordmark').evaluate(el => getComputedStyle(el).fontFamily.includes('Oxanium')), true);
  await shot('service-desk-desktop');
  await page.locator('#faq-search').fill('Portal');
  await page.locator('[data-knowledge-id="KB-SYN-FAQ-PORTAL-REQUEST-001"]').first().waitFor();
  await page.locator('[data-knowledge-id="KB-SYN-FAQ-PORTAL-REQUEST-001"]').first().click();
  await page.locator('.solution-detail').waitFor();
  await shot('faq-detail');
  for (const route of ['/jup', '/requests', '/operacao/acessos', '/operacao/prevention']) {
    const response = await page.goto(origin + base + '/demo' + route);
    assert.equal(response.status(), 404);
    await page.locator('.app-header').waitFor();
    assert.equal(await page.locator('.boot-state').count(), 0);
    report.routes.push(route);
  }
  await page.goto(origin + base + '/demo/jup');
  await page.locator('#jup-message').fill('Preciso de acesso ao Portal de Serviços para acompanhar solicitações de teste.');
  await page.locator('#jup-message').press('Enter');
  await page.getByText('Aguardando aprovação', { exact: false }).first().waitFor();
  await shot('request-created');
  async function persona(id) {
    await page.locator('.persona-menu > summary').click();
    await page.locator(`[data-persona="${id}"]`).click();
  }
  await persona('tecnico-acessos');
  await page.locator('[data-action="approve"]').click();
  await page.getByText('Concluída', { exact: false }).first().waitFor();
  await shot('request-approved');
  await persona('solicitante-demo');
  await page.locator('#jup-message').fill('Quero acesso ao Portal de Serviços para cenário de rejeição.');
  await page.locator('#jup-message').press('Enter');
  await page.getByText('Aguardando aprovação', { exact: false }).first().waitFor();
  await persona('tecnico-acessos');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-action="reject"]').click();
  await page.getByText('Rejeitada', { exact: false }).first().waitFor();
  await shot('request-rejected');
  await persona('solicitante-demo');
  await page.locator('[data-route="requests"]').first().click();
  assert.equal(await page.locator('.requester-request-row').count(), 2);
  assert.ok(await page.locator('.tracking-timeline li').count() >= 2);
  await shot('timeline');
  await page.locator('.persona-menu > summary').click();
  await page.locator('.demo-identity-config > summary').click();
  await page.locator('#demo-identity-form [name="name"]').fill('Pessoa Sintética');
  await page.locator('#demo-identity-form [name="job_title"]').fill('Analista Demo');
  await page.locator('#demo-identity-form [name="area"]').fill('Laboratório');
  await page.locator('.identity-save').click();
  await page.locator('#jup-message').waitFor();
  await page.locator('[data-route="requests"]').first().click();
  await page.getByText('Nenhuma solicitação ainda').waitFor();
  assert.equal(await page.locator('.requester-request-row').count(), 0);
  await shot('identity-isolation');
  // New contexts validate direct links and layouts without carrying client memory.
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(origin + base + '/demo/jup');
    await page.locator('#jup-message').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll('body *')].map(el => ({ tag: el.tagName, class: el.className, rect: el.getBoundingClientRect().toJSON() })).filter(el => el.rect.right > innerWidth + 1 || el.rect.left < -1).slice(0, 20) }));
    await shot('service-desk-' + width);
    assert.ok(layout.scroll <= width + 1, `overflow at ${width}: ${JSON.stringify(layout)}`);
    await page.goto(origin + base + '/');
    await page.locator('#scene-1.is-active').waitFor();
    const showcaseFont = await page.evaluate(async () => {
      await document.fonts.load('800 40px Oxanium', 'Aprovação çãõáéíóú');
      return [...document.fonts].some(font => font.family === 'Oxanium' && font.status === 'loaded');
    });
    assert.equal(showcaseFont, true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `showcase overflow at ${width}`);
    await shot('showcase-' + width);
    for (let scene = 1; scene <= sceneCount; scene++) {
      await page.locator(`#scene-${scene}.is-active`).waitFor();
      const bounds = await page.locator(`#scene-${scene} .title-art, #scene-${scene} .cover-title-mark__asset`).evaluateAll(elements => elements.map(el => {
        const r = el.getBoundingClientRect();
        return { asset: el.getAttribute('src'), fits: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 };
      }));
      assert.ok(bounds.every(title => title.fits), `title clipping ${width} scene ${scene}: ${JSON.stringify(bounds)}`);
      await shot('showcase-scene-' + scene + '-' + width);
      if (scene < sceneCount) await page.keyboard.press('ArrowRight');
    }
  }
  assert.deepEqual(report.errors, [], 'Browser runtime errors');
  assert.deepEqual(report.backendRequests, [], 'Operational backend requests');
  assert.deepEqual(report.unexpectedRequests, [], 'Unapproved network requests');
  assert.deepEqual(report.failedResources, [], 'Missing assets');
  report.status = 'PASS';
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'FAIL'; report.failure = error.message;
  console.error(error);
  process.exitCode = 1;
} finally {
  await writeFile(join(artifacts, 'smoke-report.json'), JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(done => server.close(done));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { appBasePath, resolveRoute, routePath } from '../src/router.mjs';
import { isStaticDemo, staticApiRequest } from '../src/static_demo.mjs';

test('built public bundle retains its base and static provider on any host and deep link', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  globalThis.document = { querySelector: selector => ({ content: selector.includes('jup-base-path') ? '/jup-resolve-pages/demo' : '1' }) };
  globalThis.window = { location: new URL('http://local.test/jup-resolve-pages/demo/operacao/acessos?static-demo=0') };
  try {
    assert.equal(appBasePath(), '/jup-resolve-pages/demo');
    assert.equal(resolveRoute(globalThis.window.location.pathname), 'approvals');
    assert.equal(routePath('approvals'), '/jup-resolve-pages/demo/operacao/acessos');
    assert.equal(routePath('jup'), '/jup-resolve-pages/demo/jup');
    assert.equal(isStaticDemo(globalThis.window.location), true);
  } finally { globalThis.document = originalDocument; globalThis.window = originalWindow; }
});
test('new synthetic requester cannot read another requester request or approve it', async () => {
  const request = await staticApiRequest('/api/jup/messages', {
    method: 'POST', identityId: 'solicitante-demo', body: { message: 'Quero acesso ao Portal de Serviços.' },
  });
  const identity = await staticApiRequest('/api/session/identities', {
    method: 'POST', body: { name: 'Pessoa Sintética', email: 'pessoa.sintetica@example.invalid', job_title: 'Analista', area: 'Laboratório' },
  });
  assert.deepEqual(await staticApiRequest('/api/requests', { identityId: identity.identity_id }), []);
  await assert.rejects(staticApiRequest('/api/requests/' + request.request_id, { identityId: identity.identity_id }), error => error.status === 403);
  await assert.rejects(staticApiRequest('/api/requests/' + request.request_id + '/approve', { method: 'POST', identityId: identity.identity_id }), error => error.status === 403);
});

test('new Pages deep links preserve query, hash and idempotent link prefixes', () => {
  const oldDocument = globalThis.document;
  const oldWindow = globalThis.window;
  globalThis.document = { querySelector: () => ({ content: '/jup-resolve-pages/demo' }) };
  try {
    for (const [path, route] of [['/', 'solutions'], ['/jup', 'jup'], ['/requests', 'requests'], ['/operacao/acessos', 'approvals']]) {
      globalThis.window = { location: new URL('https://demo.invalid/jup-resolve-pages/demo' + path + '?view=synthetic#detail') };
      assert.equal(resolveRoute(globalThis.window.location.pathname), route);
      assert.equal(routePath(route), '/jup-resolve-pages/demo' + path);
    }
  } finally { globalThis.document = oldDocument; globalThis.window = oldWindow; }
});

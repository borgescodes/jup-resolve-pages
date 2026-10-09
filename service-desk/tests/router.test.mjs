import test from 'node:test';
import assert from 'node:assert/strict';
import { demoIdentityForPath, resolveRoute, routeParams, routePath } from '../src/router.mjs';

for (const [path, expected] of [
  ['/', 'solutions'],
  ['/jup', 'jup'],
  ['/solucoes/KB-SYN-ERP-ACCESS-001', 'solution'],
  ['/requests', 'requests'],
  ['/operacao/acessos', 'approvals'],
  ['/operacao/m365', 'approvals'],
  ['/operacao/prevention', 'prevention'],
  ['/operations', 'approvals'],
  ['/operations/prevention', 'prevention'],
  ['/unknown', 'solutions'],
]) {
  test(`${path} resolves to ${expected}`, () => assert.equal(resolveRoute(path), expected));
}

test('solution route extracts a decoded knowledge id', () => {
  assert.deepEqual(routeParams('/solucoes/KB-SYN-ERP-ACCESS-001'), {
    knowledgeId: 'KB-SYN-ERP-ACCESS-001',
  });
});

test('public and operational paths resolve only fixed demo identities', () => {
  assert.equal(demoIdentityForPath('/'), 'solicitante-demo');
  assert.equal(demoIdentityForPath('/jup'), 'solicitante-demo');
  assert.equal(demoIdentityForPath('/operacao/acessos'), 'tecnico-acessos');
  assert.equal(demoIdentityForPath('/operacao/m365'), 'tecnico-m365');
  assert.equal(demoIdentityForPath('/operacao/prevention'), 'tecnico-geral');
});

test('routePath builds a dedicated solution path', () => {
  assert.equal(
    routePath('solution', { knowledgeId: 'KB A/B' }),
    '/solucoes/KB%20A%2FB',
  );
});

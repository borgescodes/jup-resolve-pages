import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appBasePath,
  demoIdentityForPath,
  resolveRoute,
  routePath,
  stripBasePath,
  withBasePath,
} from '../src/router.mjs';
import { isStaticDemo, staticApiRequest } from '../src/static_demo.mjs';

const pagesLocation = new URL('https://borgescodes.github.io/jup-resolve-pages/demo/jup');

test('Pages base path is removed for routing and restored for links', () => {
  const originalWindow = globalThis.window;
  globalThis.window = { location: pagesLocation };
  try {
    assert.equal(appBasePath(pagesLocation), '/jup-resolve-pages/demo');
    assert.equal(routePath('approvals'), '/jup-resolve-pages/demo/operacao/acessos');
    assert.equal(resolveRoute('/jup-resolve-pages/demo/operacao/acessos'), 'approvals');
    assert.equal(demoIdentityForPath('/jup-resolve-pages/demo/operacao/acessos'), 'tecnico-acessos');
    assert.equal(demoIdentityForPath('/jup-resolve-pages/demo/jup'), 'solicitante-demo');
    assert.equal(stripBasePath('/jup-resolve-pages/demo/jup', pagesLocation), '/jup');
    assert.equal(resolveRoute('/jup-resolve-pages/demo/jup'), 'jup');
    assert.equal(withBasePath('/requests', pagesLocation), '/jup-resolve-pages/demo/requests');
    assert.equal(
      routePath('solution', { knowledgeId: 'KB A/B' }),
      '/jup-resolve-pages/demo/solucoes/KB%20A%2FB',
    );
  } finally {
    globalThis.window = originalWindow;
  }
});

test('static demo activates only on Pages or explicit local opt-in', () => {
  assert.equal(isStaticDemo(pagesLocation), true);
  assert.equal(isStaticDemo(new URL('http://127.0.0.1:8080/?static-demo=1')), true);
  assert.equal(isStaticDemo(new URL('http://127.0.0.1:8000/')), false);
});

test('local static demo opt-in survives client-side navigation', () => {
  const originalWindow = globalThis.window;
  globalThis.window = { location: new URL('http://127.0.0.1:8080/?static-demo=1') };
  try {
    assert.equal(isStaticDemo(), true);
    globalThis.window.location = new URL('http://127.0.0.1:8080/jup');
    assert.equal(isStaticDemo(), true);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('static demo exposes only fictitious requester identity data', async () => {
  const identities = await staticApiRequest('/api/session/identities');
  const requester = identities.find(item => item.role === 'REQUESTER');

  assert.equal(requester?.name, 'Fulano de Tal');
  assert.equal(requester?.email, 'fulano.tal@example.invalid');
});

test('static demo exposes FAQ without backend transport', async () => {
  const home = await staticApiRequest('/api/faq');
  assert.ok(home.groups.length >= 4);

  const detail = await staticApiRequest('/api/faq/KB-SYN-M365-PASSWORD-001');
  assert.equal(detail.knowledge_id, 'KB-SYN-M365-PASSWORD-001');
  assert.match(detail.answer, /Microsoft 365/);
});

test('static demo supports requester to approval to completion', async () => {
  const created = await staticApiRequest('/api/jup/messages', {
    method: 'POST',
    identityId: 'solicitante-demo',
    body: { message: 'Preciso de acesso ao Portal de Serviços para acompanhar solicitações de teste.' },
  });
  assert.equal(created.status, 'PENDING_APPROVAL');

  const queue = await staticApiRequest('/api/operations/approvals', {
    identityId: 'tecnico-acessos',
  });
  const pending = queue.find(item => item.request_id === created.request_id);
  assert.ok(pending);

  const completed = await staticApiRequest(
    `/api/requests/${created.request_id}/approve`,
    {
      method: 'POST',
      identityId: 'tecnico-acessos',
      body: { expected_version: pending.version },
    },
  );
  assert.equal(completed.state, 'COMPLETED');

  const requesterItems = await staticApiRequest('/api/requests', {
    identityId: 'solicitante-demo',
  });
  assert.equal(
    requesterItems.find(item => item.request_id === created.request_id)?.state,
    'COMPLETED',
  );
});

test('static public demo uses a synthetic access portal and no company procedure URL', async () => {
  const detail = await staticApiRequest('/api/faq/KB-SYN-FAQ-PORTAL-REQUEST-001');
  assert.equal(detail.procedure_url, null);
  assert.match(detail.title, /Portal de Serviços/);
  const identities = await staticApiRequest('/api/session/identities');
  assert.ok(identities.some(item => item.role === 'REQUESTER' && item.area === 'Comercial'));
  const request = await staticApiRequest('/api/jup/messages', {
    method: 'POST', identityId: 'solicitante-demo',
    body: { message: 'Preciso de acesso ao Portal de Serviços.' },
  });
  assert.equal(request.status, 'PENDING_APPROVAL');
  assert.match(request.assistant_message, /Portal de Serviços/);
});

test('public approval and prevention projections display fictional portal labels only', async () => {
  const base = await staticApiRequest('/api/faq/KB-SYN-FAQ-PORTAL-REQUEST-001');
  assert.equal(base.system, 'PORTAL DE SERVIÇOS');
  const created = await staticApiRequest('/api/jup/messages', {
    method: 'POST', identityId: 'solicitante-demo',
    body: { message: 'Quero acesso ao Portal de Serviços.' },
  });
  assert.equal(created.status, 'PENDING_APPROVAL');
  const queue = await staticApiRequest('/api/operations/approvals', { identityId: 'tecnico-acessos' });
  const record = queue.find(item => item.request_id === created.request_id);
  assert.equal(record.system, 'PORTAL DE SERVIÇOS');
  assert.equal(record.routing.system, 'PORTAL DE SERVIÇOS');
  assert.equal(record.intent, 'PORTAL_ACCESS_REQUEST');
  assert.equal(record.capability, 'PORTAL_ACCESS_REQUEST');
  assert.equal(record.playbook_id, 'PB-SYN-PORTAL-ACCESS-001');
  assert.equal(record.policy.policy_id, 'POLICY-PORTAL-ACCESS');
  assert.equal(record.routing.technician_id, 'TECH-PORTAL');
  const prevention = await staticApiRequest('/api/operations/prevention', { identityId: 'tecnico-geral' });
  assert.ok(prevention.some(item => item.system === 'PORTAL DE SERVIÇOS'));
  const portalOpportunity = prevention.find(item => item.system === 'PORTAL DE SERVIÇOS');
  assert.equal(portalOpportunity.capability, 'PORTAL_ACCESS_REQUEST');
});

test('public identities have generic technical identifiers', async () => {
  const identities = await staticApiRequest('/api/session/identities');
  const ids = identities.map(identity => identity.identity_id);
  assert.ok(ids.includes('solicitante-demo'));
  assert.ok(ids.includes('tecnico-acessos'));
  assert.ok(ids.every(id => /^(?:solicitante|tecnico|demo)-[a-z0-9-]+$/.test(id)));
  assert.ok(identities.every(identity => !identity.email || identity.email.endsWith('@example.invalid')));
});

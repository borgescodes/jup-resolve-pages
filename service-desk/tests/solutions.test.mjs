import test from 'node:test';
import assert from 'node:assert/strict';
import { faqSearchPath, renderSolutionsHome } from '../src/solutions.mjs';

const groups = [
  {
    key: 'erp',
    label: 'ERP',
    items: [
      {
        knowledge_id: 'KB-SYN-FAQ-PORTAL-REQUEST-001',
        title: 'Como solicitar acesso ao PORTAL',
        question: 'Não consigo acessar o ERP.',
        system: 'ERP',
        category: 'ERP',
      },
    ],
  },
];

test('solutions home is task-first and does not contain marketing copy', () => {
  const html = renderSolutionsHome({ groups, searchQuery: '', searchResults: null, searching: false });
  assert.match(html, /Central de Suporte/);
  assert.match(html, /Busque por sistema, erro ou assunto/);
  assert.match(html, /Como solicitar acesso ao PORTAL/);
  assert.match(html, /Ainda não encontrou a resposta\?/);
  assert.match(html, /Falar com o Jup/);
  assert.doesNotMatch(html, /Assistente de IA|Inteligência para|transforme|revolucione/i);
});

test('solutions home renders result mode without category card grid', () => {
  const html = renderSolutionsHome({
    groups,
    searchQuery: 'PORTAL',
    searchResults: groups[0].items,
    searching: false,
  });
  assert.match(html, /1 solução encontrada/);
  assert.match(html, /data-knowledge-id="KB-SYN-FAQ-PORTAL-REQUEST-001"/);
  assert.doesNotMatch(html, /dashboard-card|metric-card|feature-card/);
});

test('empty search result leads directly to Jup', () => {
  const html = renderSolutionsHome({
    groups,
    searchQuery: 'xyz',
    searchResults: [],
    searching: false,
  });
  assert.match(html, /Nenhuma solução encontrada/);
  assert.match(html, /href="\/jup\?draft=xyz"/);
});

test('faq search path encodes the query', () => {
  assert.equal(faqSearchPath('erp azul'), '/api/faq/search?q=erp%20azul');
});

import { renderSolutionDetail } from '../src/solutions.mjs';

test('solution detail uses literal approved answer and continuation action', () => {
  const html = renderSolutionDetail({
    knowledge_id: 'KB-SYN-FAQ-PORTAL-REQUEST-001',
    title: 'Como solicitar acesso ao PORTAL',
    answer: 'Feche a sessão e tente novamente.',
    system: 'ERP',
    category: 'ERP',
    procedure_url: null,
  });
  assert.match(html, /Como solicitar acesso ao PORTAL/);
  assert.match(html, /Feche a sessão e tente novamente\./);
  assert.match(html, /Ainda precisa de ajuda\?/);
  assert.match(html, /Falar com o Jup/);
  assert.match(html, /\/jup\?from=KB-SYN-FAQ-PORTAL-REQUEST-001/);
});

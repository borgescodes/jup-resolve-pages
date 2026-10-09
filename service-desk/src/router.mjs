import { isStaticDemo } from './static_demo.mjs';

const STATIC_ROUTES = new Map([
  ['/', 'solutions'],
  ['/jup', 'jup'],
  ['/requests', 'requests'],
  ['/operacao/acessos', 'approvals'],
  ['/operacao/m365', 'approvals'],
  ['/operacao/general', 'handoffs'],
  ['/operacao/prevention', 'prevention'],
  ['/operations', 'approvals'],
  ['/operations/prevention', 'prevention'],
]);

function currentLocation() {
  return globalThis.window?.location ?? globalThis.location ?? null;
}

export function appBasePath(location = currentLocation()) {
  const configured = globalThis.document?.querySelector?.('meta[name="jup-base-path"]')?.content;
  if (configured) return configured.replace(/\/+$/, '');
  const hostname = String(location?.hostname ?? '').toLocaleLowerCase('en-US');
  if (!hostname.endsWith('.github.io')) return '';
  const firstSegment = String(location?.pathname ?? '/').split('/').filter(Boolean)[0];
  return firstSegment ? '/' + firstSegment + (String(location?.pathname ?? '').split('/')[2] === 'demo' ? '/demo' : '') : '';
}

export function stripBasePath(pathname, location = currentLocation()) {
  const base = appBasePath(location);
  const value = String(pathname || '/');
  if (!base) return value || '/';
  if (value === base) return '/';
  if (value.startsWith(`${base}/`)) return value.slice(base.length) || '/';
  return value || '/';
}

export function withBasePath(path, location = currentLocation()) {
  const value = String(path || '/');
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return value;
  const base = appBasePath(location);
  if (!base) return value.startsWith('/') ? value : `/${value}`;
  if (value === base || value.startsWith(`${base}/`) || value.startsWith(`${base}?`)) return value;
  if (value === '/') return `${base}/`;
  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
}

export function resolveRoute(pathname) {
  const normalized = stripBasePath(pathname);
  if (/^\/solucoes\/[^/]+$/.test(normalized)) return 'solution';
  return STATIC_ROUTES.get(normalized) ?? 'solutions';
}

export function routeParams(pathname) {
  const normalized = stripBasePath(pathname);
  const match = normalized.match(/^\/solucoes\/([^/]+)$/);
  return match ? { knowledgeId: decodeURIComponent(match[1]) } : {};
}

export function routePath(route, params = {}) {
  if (route === 'solutions') return withBasePath('/');
  if (route === 'jup') return withBasePath('/jup');
  if (route === 'requests') return withBasePath('/requests');
  if (route === 'solution') return withBasePath(`/solucoes/${encodeURIComponent(params.knowledgeId)}`);
  if (route === 'prevention') return withBasePath('/operacao/prevention');
  if (route === 'handoffs') return withBasePath('/operacao/general');
  return withBasePath(isStaticDemo() ? '/operacao/acessos' : '/operacao/acessos');
}

export function demoIdentityForPath(pathname) {
  const normalized = stripBasePath(pathname);
  if (normalized === '/operacao/m365') return 'tecnico-m365';
  if (normalized === '/operacao/general') return 'tecnico-geral';
  if (normalized === '/operacao/prevention') return 'tecnico-geral';
  if (normalized === '/operacao/acessos') return 'tecnico-acessos';
  if (normalized === '/operations') return 'tecnico-acessos';
  if (normalized === '/operations/prevention') return 'tecnico-geral';
  return isStaticDemo() ? 'solicitante-demo' : 'solicitante-demo';
}

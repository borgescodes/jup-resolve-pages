// Exact institutional identifiers are supplied only by an external private audit.
export function normalizePrivacyText(value) {
  let text = value;
  for (let pass = 0; pass < 4; pass++) {
    text = text.replace(/\\u\{([a-f0-9]{1,6})\}|\\u([a-f0-9]{4})|\\x([a-f0-9]{2})/gi,
      (_, a, b, c) => String.fromCodePoint(Math.min(parseInt(a ?? b ?? c, 16), 0x10ffff)))
      .replace(/&#(?:x([a-f0-9]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(Math.min(parseInt(hex ?? dec, hex ? 16 : 10), 0x10ffff)))
      .replace(/(?:%[a-f0-9]{2})+/gi, encoded => { try { return decodeURIComponent(encoded); } catch { return encoded.replace(/%([a-f0-9]{2})/gi, (_, byte) => String.fromCharCode(parseInt(byte, 16))); } })
      .replace(/['"`](?:\s|\/\*[\s\S]*?\*\/)*\+(?:\s|\/\*[\s\S]*?\*\/)*['"`]/g, '');
  }
  return text.normalize('NFKD').replace(/[\u0300-\u036f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, '').toLowerCase();
}
const publicHosts = new Set(['www.w3.org', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.boxicons.com',
  'registry.npmjs.org', 'openfontlicense.org', 'scripts.sil.org', 'gsap.com', 'greensock.com' , 'support.microsoft.com', 'bugzilla.mozilla.org']);
export function inspectPrivacyText(raw, { path = '', denylist = [] } = {}) {
  const text = normalizePrivacyText(raw.replace(/data:(?:font|image)\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=\s]+/gi, ''));
  const reasons = new Set();
  const testSource = /(?:^|\/)(?:tests|scripts)\//.test(path);
  const attribution = /(?:^|\/)vendor\/|(?:OFL|LICENSE|NOTICE|ATTRIBUTION)(?:\.[^/]+)?$/i.test(path);
  if (/-----begin (?:rsa |ec |openssh )?private key-----|\bgh[pousr]_[a-z0-9]{36,255}\b|\bgithub_pat_[a-z0-9_]{40,255}\b|\bakia[a-z0-9]{16}\b|\bsk-[a-z0-9_-]{20,}\b/.test(text)) reasons.add('credential');
  for (const email of text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g) ?? []) {
    if (!attribution && !/@(?:example\.(?:invalid|com|org)|static-demo\.invalid)$/.test(email) &&
        !(testSource && /@[^@]+\.(?:test|invalid|example)$/.test(email))) reasons.add('non-synthetic-email');
  }
  for (const url of text.match(/https?:\/\/[^\s'"`<>\\)]+/g) ?? []) {
    let parsed; try { parsed = new URL(url); } catch { continue; }
    const host = parsed.hostname;
    if (testSource && (['localhost', '127.0.0.1', '[::1]', 'demo', 'cdn.'].includes(host) || /\.(?:test|invalid|example)$/.test(host) || host.includes('${'))) continue;
    if (attribution && ['github.com', 'scripts.sil.org', 'openfontlicense.org'].includes(host)) continue;
    if (publicHosts.has(host) || /\.(?:invalid|example)$/.test(host)) continue;
    if (host === 'github.com' && /^\/(?:google\/fonts|sevmeyer\/oxanium|jetbrains\/jetbrainsmono|gitleaks\/gitleaks|sponsors\/|borgescodes\/jup-resolve-pages(?:\/|$))/.test(parsed.pathname)) continue;
    if (host === 'borgescodes.github.io' && parsed.pathname.startsWith('/jup-resolve-pages/')) continue;
    reasons.add('unapproved-url');
  }
  if (/github\.com\/[^/\s]+\/[^/\s]+\/blob\/[a-f0-9]{40}\//.test(text)) reasons.add('pinned-source-reference');
  if (/(?:publication|prepare|migration)\/[a-z0-9_-]+/.test(text)) reasons.add('migration-reference');
  for (const term of denylist.map(normalizePrivacyText)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if ((term.length <= 3 ? new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`) : new RegExp(escaped)).test(text)) reasons.add('private-denylist');
  }
  return [...reasons];
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('deploy cannot run without explicit authorization and exact audited SHA', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/validate.yml', import.meta.url), 'utf8');
  const parts = workflow.split('\n  deploy:\n');
  assert.equal(parts.length, 2);
  const deploy = parts[1];
  for (const guard of [
    "github.event_name == 'workflow_dispatch'",
    "github.ref == 'refs/heads/main'",
    "vars.PUBLICATION_AUTHORIZED == 'true'",
    'vars.PRIVATE_AUDIT_APPROVED_SHA == github.sha',
    'test "$PUBLICATION_FLAG" = "true"',
    'test -n "$PRIVATE_AUDIT_SHA"',
    'test "$PRIVATE_AUDIT_SHA" = "$CURRENT_SHA"',
    'needs: validate',
  ]) assert.ok(deploy.includes(guard), `Missing release guard: ${guard}`);
  assert.ok(deploy.indexOf('Verify audited SHA and publication authorization') < deploy.indexOf('actions/deploy-pages@v4'));
});

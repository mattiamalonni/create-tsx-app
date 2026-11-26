import assert from 'node:assert/strict';
import http from 'node:http';
import test, { type TestContext } from 'node:test';

import { refreshPlanVersions, resolveLatestVersions } from '../src/versions.ts';

async function registry(t: TestContext): Promise<string> {
  const server = http.createServer((request, response) => {
    if (request.url?.includes('missing')) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ version: '9.9.9' }));
  });

  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  return new Promise<string>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`);
    });
  });
}

test('resolves latest versions from the configured registry and keeps failures out', async (t) => {
  const previous = process.env.npm_config_registry;
  process.env.npm_config_registry = await registry(t);
  t.after(() => {
    if (previous === undefined) delete process.env.npm_config_registry;
    else process.env.npm_config_registry = previous;
  });

  const versions = await resolveLatestVersions(['alpha', '@scope/beta', 'missing']);
  assert.deepEqual(versions, { alpha: '^9.9.9', '@scope/beta': '^9.9.9' });
});

test('refreshPlanVersions rewrites only packages resolved from the registry', async (t) => {
  const previous = process.env.npm_config_registry;
  process.env.npm_config_registry = await registry(t);
  t.after(() => {
    if (previous === undefined) delete process.env.npm_config_registry;
    else process.env.npm_config_registry = previous;
  });

  const plan = [
    {
      path: 'package.json',
      content: JSON.stringify({ dependencies: { alpha: '^1.0.0', missing: '^2.0.0' } }),
    },
  ];

  const result = await refreshPlanVersions(plan);
  assert.deepEqual(result, { resolved: 1, failed: 1 });
  const manifest = JSON.parse(plan[0]?.content ?? '{}') as { dependencies: Record<string, string> };
  assert.equal(manifest.dependencies.alpha, '^9.9.9');
  assert.equal(manifest.dependencies.missing, '^2.0.0');
});

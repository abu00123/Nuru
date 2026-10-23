import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

process.env.EXPO_PUBLIC_API_URL = 'https://nuru.example/api/';
const source = readFileSync(new URL('../src/api.ts', import.meta.url), 'utf8');
const api = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`);
test('filters use the existing Django category name and commune contract', async () => {
  globalThis.fetch = async url => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/api/information/');
    assert.equal(parsed.searchParams.get('search'), 'housing & help');
    assert.equal(parsed.searchParams.get('category'), 'Housing');
    assert.equal(parsed.searchParams.get('destination'), 'A B');
    return new Response(JSON.stringify([{ id: 1 }]));
  };
  assert.deepEqual(await api.getInformation(' housing & help ', 'Housing', 'A B'), [{ id: 1 }]);
});
test('accepts a paginated API response', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ results: [{ id: 2 }] }));
  assert.deepEqual(await api.getCategories(), [{ id: 2 }]);
});
test('report sends only public report fields', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://nuru.example/api/reports/');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { information_entry: 4, reason: 'incorrect', comment: 'Please check' });
    return new Response('{}', { status: 201 });
  };
  await api.submitReport(4, 'incorrect', ' Please check ');
});
test('server errors are surfaced', async () => {
  globalThis.fetch = async () => new Response('{}', { status: 503 });
  await assert.rejects(api.getDetail(1), /503/);
});

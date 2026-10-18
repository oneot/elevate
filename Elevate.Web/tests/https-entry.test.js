import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

it('redirects the production HTTP origin before bootstrap while preserving the entire route', () => {
  const url = new URL('http://microsoft-elevate.com/forms/post?q=%ED%95%99%EA%B5%90&page=2#heading');
  const replace = vi.fn();
  runInNewContext(script, { window: { location: { href: url.href, protocol: url.protocol, hostname: url.hostname, replace } }, URL });
  expect(replace).toHaveBeenCalledWith('https://microsoft-elevate.com/forms/post?q=%ED%95%99%EA%B5%90&page=2#heading');
  expect(html.indexOf(script)).toBeLessThan(html.indexOf('type="module"'));
});

it.each([
  'https://microsoft-elevate.com/all',
  'http://localhost:5173/all',
  'http://127.0.0.1:5173/all',
  'http://192.0.2.10:5173/all',
  'http://preview.example.test/all',
  'http://microsoft-elevate.com.example.test/all',
])('does not redirect HTTPS, local development, or other hosts: %s', (href) => {
  const url = new URL(href);
  const replace = vi.fn();
  runInNewContext(script, { window: { location: { href, protocol: url.protocol, hostname: url.hostname, replace } }, URL });
  expect(replace).not.toHaveBeenCalled();
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.className = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  querySelectorAll(selector) {
    const selectors = selector.split(',').map((item) => item.trim().toUpperCase());
    const matches = [];
    const visit = (element) => {
      if (selectors.includes(element.tagName)) matches.push(element);
      element.children.forEach(visit);
    };
    this.children.forEach(visit);
    return matches;
  }
}

function loadOptimizeEmbeddedMedia() {
  const source = fs.readFileSync(new URL('../src/utils/html.js', import.meta.url), 'utf8')
    .replace(/^import\s+DOMPurify\s+from\s+['"]dompurify['"];\s*$/m, '')
    .replace(/\bexport\s+(?=(?:async\s+)?function\b)/g, '')
    .replace(/\bexport\s+(?=(?:let|const|var)\b)/g, '');

  const context = {
    DOMPurify: { sanitize: (value) => value },
  };
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.optimizeEmbeddedMedia = optimizeEmbeddedMedia;`, context);
  return context.optimizeEmbeddedMedia;
}

const optimizeEmbeddedMedia = loadOptimizeEmbeddedMedia();

{
  const container = new FakeElement('div');
  const firstImage = new FakeElement('img');
  const secondImage = new FakeElement('img');
  secondImage.setAttribute('loading', 'eager');
  const iframe = new FakeElement('iframe');

  container.appendChild(firstImage);
  container.appendChild(secondImage);
  container.appendChild(iframe);

  optimizeEmbeddedMedia(container);

  assert.equal(firstImage.getAttribute('loading'), 'lazy');
  assert.equal(firstImage.getAttribute('decoding'), 'async');
  assert.equal(firstImage.getAttribute('fetchpriority'), 'auto');
  assert.equal(firstImage.getAttribute('sizes'), '(min-width: 1024px) 768px, 100vw');
  assert.match(firstImage.className, /post-content-media/);

  assert.equal(secondImage.getAttribute('loading'), 'eager');
  assert.equal(secondImage.getAttribute('decoding'), 'async');
  assert.equal(secondImage.getAttribute('fetchpriority'), 'auto');
  assert.match(secondImage.className, /post-content-media/);

  assert.equal(iframe.getAttribute('loading'), 'lazy');
  assert.match(iframe.className, /post-content-iframe/);
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.className = '';
    this.hidden = false;
    this.id = '';
    this.style = {};
    this.listeners = new Map();
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  insertBefore(child, reference) {
    child.parentNode = this;
    const index = this.children.indexOf(reference);
    if (index === -1) {
      this.children.push(child);
    } else {
      this.children.splice(index, 0, child);
    }
    return child;
  }

  replaceWith(replacement) {
    const siblings = this.parentNode.children;
    const index = siblings.indexOf(this);
    replacement.parentNode = this.parentNode;
    siblings[index] = replacement;
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
  }

  getAttribute(name) {
    if (name === 'id') return this.id;
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  removeEventListener(type) {
    this.listeners.delete(type);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (element) => {
      if (selector === 'code' && element.tagName === 'CODE') matches.push(element);
      if (selector === '.collapsible-code-copy' && element.className === 'collapsible-code-copy') matches.push(element);
      if (selector === '.collapsible-code-toggle' && element.className === 'collapsible-code-toggle') matches.push(element);
      if (
        selector === 'pre:not([data-collapsible-injected])' &&
        element.tagName === 'PRE' &&
        !element.hasAttribute('data-collapsible-injected')
      ) {
        matches.push(element);
      }
      element.children.forEach(visit);
    };
    this.children.forEach(visit);
    return matches;
  }

  scrollIntoView() {}
}

function elementTree(element) {
  return {
    tagName: element.tagName,
    className: element.className,
    textContent: element.textContent,
    children: element.children.map(elementTree),
  };
}

function makeCodeBlock(text, attributes = {}) {
  const container = new FakeElement('div');
  const pre = new FakeElement('pre');
  const code = new FakeElement('code');
  code.textContent = text;
  Object.entries(attributes).forEach(([name, value]) => pre.setAttribute(name, value));
  pre.appendChild(code);
  container.appendChild(pre);
  return container;
}

function loadInjectCollapsibleCodeBlocks() {
  const source = fs.readFileSync(new URL('../src/utils/html.js', import.meta.url), 'utf8')
    .replace("import DOMPurify from 'dompurify';", '')
    .replaceAll('export function ', 'function ')
    .replace('let _collapsibleSeq = 0;', 'var _collapsibleSeq = 0;');

  const context = {
    DOMPurify: { sanitize: (value) => value },
    document: {
      createElement: (tagName) => new FakeElement(tagName),
      body: new FakeElement('body'),
      execCommand: () => true,
    },
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    requestAnimationFrame: (callback) => callback(),
    setTimeout: (callback) => {
      callback();
      return 0;
    },
  };
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.injectCollapsibleCodeBlocks = injectCollapsibleCodeBlocks;`, context);
  return context.injectCollapsibleCodeBlocks;
}

const injectCollapsibleCodeBlocks = loadInjectCollapsibleCodeBlocks();

{
  const container = makeCodeBlock(Array.from({ length: 9 }, (_, index) => `line ${index + 1}`).join('\n'));
  injectCollapsibleCodeBlocks(container);

  assert.equal(container.querySelectorAll('.collapsible-code-copy').length, 1, JSON.stringify(elementTree(container)));
  assert.equal(container.querySelectorAll('.collapsible-code-toggle').length, 0);
}

{
  const longCode = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n');
  const container = makeCodeBlock(longCode);
  injectCollapsibleCodeBlocks(container);

  assert.equal(container.querySelectorAll('.collapsible-code-copy').length, 1);
  assert.equal(container.querySelectorAll('.collapsible-code-toggle').length, 1);
}

{
  const longCode = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n');
  const container = makeCodeBlock(longCode, { 'data-collapsible': 'false' });
  injectCollapsibleCodeBlocks(container);

  assert.equal(container.querySelectorAll('.collapsible-code-copy').length, 1);
  assert.equal(container.querySelectorAll('.collapsible-code-toggle').length, 0);
}

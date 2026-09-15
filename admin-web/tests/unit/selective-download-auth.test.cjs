const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { createRequire } = require('node:module');

const dependencyRoot = process.env.CUBICI_TEST_DEPENDENCY_ROOT || path.resolve(__dirname, '../..');
const dependencyRequire = createRequire(path.join(dependencyRoot, 'package.json'));
const esbuild = createRequire(dependencyRequire.resolve('vite'))('esbuild');
const React = dependencyRequire('react');
const jsxRuntime = dependencyRequire('react/jsx-runtime');
const root = path.resolve(__dirname, '../../..');
const file = { uuid: 'file/id', origin_file_name: 'document', file_ext: 'pdf' };

// Execute actual source with isolated hooks/DOM. No server, DB, credentials,
// network, Vite configuration, or build output is used.
function harness({ response = () => new Response('synthetic bytes'), clickError = false } = {}) {
  const storage = new Map([
    ['cubiciUserAuth', JSON.stringify({ access_token: 'unit-user', user: { user_no: 999, user_type: 'USER' } })],
    ['cubiciAdminAuth', JSON.stringify({ access_token: 'unit-admin', user: { user_type: 'ADMIN_USER' } })],
  ]);
  const events = [], requests = [], blobs = [], slots = [];
  const timers = new Map(), cache = new Map();
  let cursor = 0, timerId = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useEffect() {},
    useCallback: callback => callback,
    useMemo: callback => callback(),
    useRef: initial => ({ current: initial }),
  };
  const window = {
    location: {
      pathname: '/', search: '', origin: 'https://app.example.test',
      get href() { return this.origin + this.pathname + this.search; },
      replace: url => events.push(['replace', url]),
      assign: url => events.push(['assign', url]),
    },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => { storage.delete(key); events.push(['clear', key]); },
    },
  };
  class MockURL extends URL {
    static createObjectURL(blob) { blobs.push(blob); return 'blob:unit-document'; }
    static revokeObjectURL(url) { events.push(['revoke', url]); }
  }
  const context = vm.createContext({
    window, URL: MockURL, URLSearchParams, Headers, Request, AbortController, TypeError,
    setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    document: {
      body: { appendChild: () => events.push(['append']) },
      createElement(tag) {
        assert.equal(tag, 'a');
        return {
          click() { events.push(['click', this.href, this.download]); if (clickError) throw new Error('click failed'); },
          remove() { events.push(['remove']); },
        };
      },
    },
  });
  window.fetch = async (url, options) => { requests.push({ url, options }); return response(url, options); };
  Object.defineProperty(context, 'fetch', { get: () => window.fetch });
  function load(relative) {
    const absolute = path.resolve(root, relative);
    assert.ok(absolute.startsWith(root + path.sep));
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const module = { exports: {} };
    cache.set(absolute, module);
    let source = fs.readFileSync(absolute, 'utf8');
    if (relative.endsWith('AdminDashboardPage.jsx')) source += '\nexport { DocumentFileManager };';
    if (relative.endsWith('AdminLayout.jsx')) source += '\nexport { AdminHeader };';
    const code = esbuild.transformSync(source, {
      loader: 'jsx', format: 'cjs', jsx: 'automatic',
      define: { 'import.meta.env': '{"VITE_API_BASE_URL":"https://api.example.test"}' },
    }).code;
    const localRequire = id => {
      if (id === 'react') return hooks;
      if (id === 'react/jsx-runtime') return jsxRuntime;
      assert.ok(id.startsWith('.'), `unexpected dependency: ${id}`);
      return load(path.relative(root, path.resolve(path.dirname(absolute), id)));
    };
    vm.runInContext(`(function(module, exports, require) {${code}\n})`, context, { filename: absolute })(module, module.exports, localRequire);
    return module.exports;
  }
  return {
    load, storage, events, requests, blobs, slots, window, timers,
    render(Component, props = {}) { cursor = 0; return Component(props); },
    cleanup() {
      for (const [id, timer] of timers) {
        if (timer.delay === 1_000) { timers.delete(id); timer.callback(); }
      }
    },
  };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

function downloader(h, role, item = file) {
  return role === 'user'
    ? () => h.load('user-web/src/shared/UserCore.jsx').downloadContractDocumentForUser('contract/id', item, 999)
    : () => h.load('admin-web/src/api/contracts.js').downloadContractDocument('contract/id', item);
}

for (const role of ['user', 'admin']) {
  test(`${role}: authenticated Blob download preserves bytes and releases DOM/URL`, async () => {
    const h = harness();
    await downloader(h, role)();
    assert.equal(h.requests.length, 1);
    const { url, options } = h.requests[0];
    assert.equal(options.headers.Authorization, `Bearer unit-${role}`);
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    assert.match(url, /contracts\/contract%2Fid\/documents\/files\/file%2Fid\/download/);
    assert.equal(new URL(url).search, role === 'user' ? '?user_no=999' : '');
    assert.doesNotMatch(url, /unit-user|unit-admin|Bearer/);
    assert.equal(await h.blobs[0].text(), 'synthetic bytes');
    assert.deepEqual(h.events.find(event => event[0] === 'click'), ['click', 'blob:unit-document', 'document.pdf']);
    assert.ok(h.events.some(event => event[0] === 'remove'));
    assert.equal(h.events.some(event => event[0] === 'revoke'), false);
    h.cleanup();
    assert.deepEqual(h.events.at(-1), ['revoke', 'blob:unit-document']);
    assert.equal(h.timers.size, 0);
  });

  for (const status of [401, 403, 500]) {
    test(`${role}: HTTP ${status} never downloads an error body`, async () => {
      const h = harness({ response: () => new Response('failure', { status }) });
      await assert.rejects(downloader(h, role)(), status === 401 ? /로그인이 만료/ : status === 403 ? /권한/ : /500/);
      assert.equal(h.blobs.length, 0);
      assert.equal(h.events.some(event => event[0] === 'click'), false);
      assert.equal(h.timers.size, 0);
    });
  }

  test(`${role}: absent session fails closed without fetching`, async () => {
    const h = harness();
    h.storage.delete(role === 'user' ? 'cubiciUserAuth' : 'cubiciAdminAuth');
    await assert.rejects(downloader(h, role)(), /로그인이 필요/);
    assert.equal(h.requests.length, 0);
  });

  test(`${role}: filename separators/control characters are sanitized`, async () => {
    const h = harness();
    await downloader(h, role, { ...file, origin_file_name: 'a/b\\c\u0000' })();
    assert.equal(h.events.find(event => event[0] === 'click')[2], 'a_b_c_.pdf');
    h.cleanup();
  });

  test(`${role}: button disables while pending, shows failure and permits retry`, async () => {
    let status = 401;
    const h = harness({ response: () => new Response('synthetic bytes', { status }) });
    let Component, props;
    if (role === 'user') {
      Component = h.load('user-web/src/pages/MoneybankPages.jsx').ContractDetailPage;
      props = { mbid: 'contract/id' };
      h.slots[1] = { loading: false, message: '', detail: { contract: {} }, documents: { items: [file] } };
    } else {
      Component = h.load('admin-web/src/pages/AdminDashboardPage.jsx').DocumentFileManager;
      props = { mbid: 'contract/id', files: [file], isComplete: false };
    }
    const render = () => h.render(Component, props);
    const button = tree => find(tree, node => node.type === 'button' && node.props.children === '다운로드');
    assert.equal(find(render(), node => node.type === 'a' && node.props.children === '다운로드'), null);
    const pending = button(render()).props.onClick();
    assert.equal(button(render()).props.disabled, true);
    await pending;
    assert.equal(button(render()).props.disabled, false);
    assert.match(find(render(), node => node.props?.role === 'alert').props.children, /로그인이 만료/);
    status = 200;
    await button(render()).props.onClick();
    assert.equal(find(render(), node => node.props?.role === 'alert'), null);
    assert.equal(h.blobs.length, 1);
    h.cleanup();
  });

  test(`${role}: network failure releases the request timer`, async () => {
    const h = harness({ response: () => { throw new TypeError('Failed to fetch'); } });
    await assert.rejects(downloader(h, role)(), /API 서버에 연결/);
    assert.equal(h.timers.size, 0);
  });

  test(`${role}: timeout also covers response body consumption`, async () => {
    let bodyStarted;
    const bodyReady = new Promise(resolve => { bodyStarted = resolve; });
    const h = harness({ response: (_url, { signal }) => ({
      ok: true,
      blob: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        bodyStarted();
      }),
    }) });
    const pending = downloader(h, role)();
    await bodyReady;
    [...h.timers.values()].find(timer => timer.delay === 45_000).callback();
    await assert.rejects(pending, /응답 시간이 초과/);
    assert.equal(h.timers.size, 0);
  });

  test(`${role}: failed DOM click still cleans the anchor and Blob URL`, async () => {
    const h = harness({ clickError: true });
    await assert.rejects(downloader(h, role)(), /click failed/);
    assert.ok(h.events.some(event => event[0] === 'remove'));
    h.cleanup();
    assert.deepEqual(h.events.at(-1), ['revoke', 'blob:unit-document']);
    assert.equal(h.timers.size, 0);
  });
}

test('user logout already clears auth/mobile state and reloads the existing /main route', () => {
  const h = harness();
  const { Header } = h.load('user-web/src/shared/UserCore.jsx');
  h.slots[2] = true;
  const button = find(h.render(Header), node => node.type === 'button' && node.props.children === '로그아웃');
  button.props.onClick();
  assert.equal(h.storage.has('cubiciUserAuth'), false);
  assert.equal(h.slots[0], null);
  assert.equal(h.slots[2], false);
  assert.deepEqual(h.events, [['clear', 'cubiciUserAuth'], ['assign', '/main']]);
  assert.equal(find(h.render(Header), node => node.type === 'button' && node.props.children === '로그아웃'), null);
  assert.equal(h.storage.has('cubiciAdminAuth'), true);
});

for (const props of [{ userNo: undefined }, { userNo: 999, enabled: false }]) {
  test(`user dashboard already clears prior data without fetching: ${JSON.stringify(props)}`, async () => {
    const h = harness();
    h.slots[0] = { contracts: { items: [{ mbid: 'old-contract' }] }, sales: { items: [{ id: 'old-sale' }] } };
    const { useUserDashboardData } = h.load('user-web/src/shared/UserCore.jsx');
    const state = await h.render(useUserDashboardData, props).refresh();
    for (const key of ['contracts', 'sales', 'returns', 'settlements', 'redemptions']) {
      assert.equal(state[key].items.length, 0);
      assert.equal(state[key].total, 0);
    }
    assert.equal(state.accounts, null);
    assert.equal(h.requests.length, 0);
    assert.equal(h.slots[0], state);
  });
}

test('admin header uses /admin/logout and the existing route clears its session', () => {
  const h = harness();
  const { AdminHeader } = h.load('admin-web/src/components/layout/AdminLayout.jsx');
  const link = find(h.render(AdminHeader), node => node.type === 'a' && node.props.children === '로그아웃');
  assert.equal(link.props.href, '/admin/logout');
  h.window.location.pathname = link.props.href;
  assert.equal(h.render(h.load('admin-web/src/App.jsx').default), null);
  assert.equal(h.storage.has('cubiciAdminAuth'), false);
  assert.deepEqual(h.events, [['clear', 'cubiciAdminAuth'], ['replace', '/admin']]);
  assert.equal(h.storage.has('cubiciUserAuth'), true);
});

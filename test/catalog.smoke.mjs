// Node smoke test for the `./catalog` SSR export.
//
// Deliberately NOT part of the main vitest suite: that suite runs in browser
// mode (Playwright), whereas this verifies the server-side path — that the
// generated `catalog.js` resolves a known tag to its class through
// @webtides/element-js-ssr-renderer. Run via `npm run test:catalog`, which
// regenerates `catalog.js` first (it is gitignored, shipped via `files`).
//
// Plain Node + node:assert, no test runner. Exits non-zero on failure.

import assert from 'node:assert/strict';
import '@webtides/element-js-ssr-renderer/dom-shim'; // must precede any component import
import { renderToString } from '@webtides/element-js-ssr-renderer';
import catalog from '../catalog.js';

const TAG = 'el-button';

assert.ok(catalog && typeof catalog === 'object', 'catalog default export is an object');
assert.ok(TAG in catalog, `catalog contains a "${TAG}" entry`);
assert.equal(typeof catalog[TAG], 'function', `"${TAG}" entry is a lazy loader`);

// The consumer path: hand the imported catalog straight to `resolve` (no wrapper).
const out = await renderToString(`<${TAG}>Click</${TAG}>`, { resolve: catalog });
assert.match(out, /<template shadowrootmode="open"/, `"${TAG}" rendered Declarative Shadow DOM via resolve`);

console.log(`✓ catalog smoke: ${Object.keys(catalog).length} entries; "${TAG}" → DSD through resolve`);

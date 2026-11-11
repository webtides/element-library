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
import { readFileSync } from 'node:fs';
import '@webtides/element-js-ssr-renderer/dom-shim'; // must precede any component import
import { renderToString } from '@webtides/element-js-ssr-renderer';
import catalog from '../catalog.js';

const TAG = 'el-button';

assert.ok(catalog && typeof catalog === 'object', 'catalog default export is an object');
assert.ok(TAG in catalog, `catalog contains a "${TAG}" entry`);
assert.equal(typeof catalog[TAG], 'function', `"${TAG}" entry is a lazy loader`);

// The catalog is built from custom-elements.json. `cem analyze` falls back to its defaults and still
// exits 0 when custom-elements-manifest.config.mjs fails to import. The manifest then lists test and
// story files too, and a class a test file registers ends up as a catalog entry for a file that is
// not in the package. Both files are checked, so the fallback cannot pass unnoticed.
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const manifest = JSON.parse(read('custom-elements.json'));
const strayModules = manifest.modules
    .map((module) => module.path)
    .filter((path) => /\.(test\.\w+|stories)\.js$/.test(path));
assert.deepEqual(strayModules, [], 'custom-elements.json lists no test or story modules (did its config load?)');

const loaders = [...read('catalog.js').matchAll(/import\((['"])(\.[^'"]+)\1\)/g)].map((match) => match[2]);
assert.equal(loaders.length, Object.keys(catalog).length, 'every catalog entry has one loader');
for (const loader of loaders) {
    assert.match(
        loader,
        /^\.\/src\/components\/([a-z-]+)\/\1\.js$/,
        `catalog loader "${loader}" is a component module`,
    );
}

// The consumer path: hand the imported catalog straight to `resolve` (no wrapper).
const out = await renderToString(`<${TAG}>Click</${TAG}>`, { resolve: catalog });
assert.match(out, /<template shadowrootmode="open"/, `"${TAG}" rendered Declarative Shadow DOM via resolve`);

console.log(`✓ catalog smoke: ${Object.keys(catalog).length} entries; "${TAG}" → DSD through resolve`);

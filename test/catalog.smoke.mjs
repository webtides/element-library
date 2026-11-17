// Node smoke test for the `./catalog` SSR export.
//
// Deliberately NOT part of the main vitest suite: that suite runs in browser
// mode (Playwright), whereas this verifies the server-side path — that the
// generated `catalog.js` resolves a known tag to its class through
// @webtides/element-js-ssr-renderer. Run via `npm run test:catalog`, which
// regenerates `catalog.js` first (it is gitignored, shipped via `files`).
//
// It also checks the manifest the catalog is made from, `custom-elements.json`: that its config
// has loaded, and that its types are types.
//
// Plain Node + node:assert, no test runner. Exits non-zero on failure.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// The TypeScript the manifest is analyzed with. The one of the project (7) has no parser to call.
import { ts } from '@custom-elements-manifest/analyzer';
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

// The analyzer finds the files in an order that is another one with every run. The config of the
// manifest hands them over in the order of their paths, so that the same sources give the same
// manifest and the same `web-types.json`, byte for byte.
const modulePaths = manifest.modules.map((module) => module.path);
assert.deepEqual(
    modulePaths,
    [...modulePaths].sort(),
    'the modules of custom-elements.json are in the order of their paths',
);

// The manifest is what a tool reads that knows nothing else about the components: the completion of
// an editor, a generator of the typings a template language checks its markup with. Such a tool
// writes the types of the manifest into TypeScript as they are. So each of them has to be a type,
// and an attribute or an event of an element without one is `any` for it. A type that is not one
// came from JSDoc the analyzer reads in another way than its author: the text of the tags that
// follow, for a parameter whose properties are documented one by one.
const isType = (text) => {
    const source = `type T = ${text};`;
    const { statements } = ts.createSourceFile('type.ts', source, ts.ScriptTarget.Latest);
    const { diagnostics } = ts.transpileModule(source, { reportDiagnostics: true });
    return diagnostics.length === 0 && statements.length === 1 && ts.isTypeAliasDeclaration(statements[0]);
};
const named = (entry, index) => entry?.name ?? entry?.path ?? index;
const typesOf = (node, trail = 'custom-elements.json') => {
    if (Array.isArray(node)) return node.flatMap((entry, index) => typesOf(entry, `${trail} > ${named(entry, index)}`));
    if (!node || typeof node !== 'object') return [];
    const own = typeof node.type?.text === 'string' ? [{ trail, text: node.type.text }] : [];
    return [...own, ...Object.values(node).flatMap((value) => typesOf(value, trail))];
};
const types = typesOf(manifest.modules);
assert.ok(types.length > 0, 'custom-elements.json has types');
assert.deepEqual(
    types.filter(({ text }) => !isType(text)),
    [],
    'every type in custom-elements.json is a TypeScript type',
);

const elements = manifest.modules.flatMap((module) => module.declarations ?? []).filter((entry) => entry.tagName);
const untyped = elements.flatMap((element) =>
    [...(element.attributes ?? []), ...(element.events ?? [])]
        .filter((entry) => !entry.type?.text)
        .map((entry) => `${element.tagName} ${entry.name}`),
);
assert.deepEqual(untyped, [], 'every attribute and every event of an element has a type in custom-elements.json');

// The analyzer writes the type of a superclass over the one a class gives to what it inherits, and
// the config of the manifest puts it back. Nothing in the manifest alone shows whether it did, so
// an example stands for it: the value of a tag field is a list, the one of the form field a text.
const tagField = elements.find((element) => element.tagName === 'el-tag-field');
const typeOf = (kind, name) => tagField?.[kind]?.find((entry) => entry.name === name)?.type?.text;
assert.deepEqual(
    [typeOf('members', 'value'), typeOf('attributes', 'value'), typeOf('events', 'input-change')],
    ['string[]', 'string[]', 'CustomEvent<string[]>'],
    'what a component types itself has that type in custom-elements.json, not the one of its superclass',
);

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
console.log(`✓ manifest: ${types.length} types of ${elements.length} elements`);

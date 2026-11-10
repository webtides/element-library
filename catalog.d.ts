/**
 * Declaration for the `./catalog` export. Hand-written, unlike the generated `catalog.js` next to it.
 *
 * The catalog maps every custom element tag of the library to a lazy loader of its module:
 * `{ 'el-button': () => import('./src/components/button/button.js'), … }`. Pass it to the `resolve`
 * option of `@webtides/element-js-ssr-renderer`.
 *
 * The type is written out structurally instead of importing `Catalog` from the renderer, so it
 * resolves whether or not the renderer ships declarations. A loader map is one of the shapes the
 * renderer's `Catalog` accepts.
 */
declare const catalog: Record<string, () => Promise<unknown>>;

export default catalog;

// Type-level check for the `./catalog` export, compiled by `npm run test:catalog` and never run.
// A strict TypeScript consumer must get a typed default export without a `declare module` shim.

import catalog from '@webtides/element-library/catalog';

// tag → lazy loader, the shape the `resolve` option of @webtides/element-js-ssr-renderer takes
const loader: () => Promise<unknown> = catalog['el-button'];

// @ts-expect-error an entry is a loader, not a string. Without this the check would also pass for `any`.
const notAString: string = catalog['el-button'];

export { loader, notAString };

# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Changed

- A notification that is already open when it is first rendered in the browser now appears without the enter transition, the same way a server-rendered one does. Opening it later (`show()`, `toast()`, setting `open`) still animates.
- On a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high (18 × 18 px before). Its icon keeps its size, and a one-line notification grows with the button. Unchanged on a fine pointer and without the token.

### Fixed

- A server-rendered open notification (Declarative Shadow DOM) is visible before its JavaScript runs, and stays visible without JavaScript. It used to be transparent until `connected()` added the `showing` class, and then faded in. A server-rendered closed notification no longer reserves its height before the element is connected. Until the element is connected the resting state follows the `open` attribute; afterwards `show()` / `hide()` / `toast()` animate as before.
- The default variant icon is drawn again when the element is rendered in the browser (a toast, or a notification a framework creates after load). The icon shapes were a template nested inside the `<svg>`, which put them into the HTML namespace on client render, so the icon was an empty box; server-rendered notifications were not affected. Each variant now renders one complete `<svg>` template.

## [0.1.2] - 2026-06-04

### Fixed

- The published package now ships the runtime `src/utils/transitions.js` this component imports; `0.1.1` shipped only its type declaration, so importing `el-notification` from the published package failed to resolve `../../utils/transitions.js`. Fixed via the root `files` allowlist (see root [`CHANGELOG.md`](../../../CHANGELOG.md)).

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-notification` — an alert/notification that can be shown inline or as a transient toast (`toast()` floats it into a shared top-right stack). API modelled on Shoelace's `<sl-alert>`.
- Semantic `variant` (`default` / `primary` / `success` / `neutral` / `warning` / `danger`) with per-variant accent + default icon, optional `closable` close button, and optional auto-dismiss (`duration`, default `Infinity`) that pauses while the pointer/focus is inside.
- `show()` / `hide()` (promise-returning) and `toast()` methods; `notification-show` / `-after-show` / `-hide` / `-after-hide` events; `open` reflected attribute + custom state.
- The host is exposed as an ARIA live region — `role="alert"` (assertive) for `danger` / `warning`, `role="status"` (polite) otherwise — so toasts are announced when they appear.

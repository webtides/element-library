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

- On a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high (20 × 20 px before). Its icon keeps its size, and the header grows with the button. Unchanged on a fine pointer and without the token.
- `dialog-after-show` and `dialog-after-hide` fire only when the dialog has got there. A way that is cut short has none, so after `dialog-show` comes `dialog-after-show` or `dialog-hide`, and after `dialog-hide` comes `dialog-after-hide` or `dialog-show`; before, `dialog-after-show` could fire after the dialog had closed again. The promises of `show()` and `hide()` resolve when the dialog is at rest, at whichever end, and never reject; a `show()` while the dialog is still coming in waits for that way, where it resolved at once. Two changes of `open` before the next frame that cancel each other do nothing and fire nothing. Nothing changes for a dialog that opens and closes undisturbed. ([#110](https://github.com/webtides/element-library/issues/110))

### Fixed

- A dialog that is taken out of the page while it is open gives the page its scrolling back. Before, the page stayed locked (`overflow: hidden` on the document) with no dialog left to close, and a dialog opened later did not unlock it either, because the lock counts its holders. Put back into the page while `open`, the dialog opens as a modal again; before, it was shown in the flow of the page, without a backdrop and without taking the focus.
- An empty footer takes no room. The footer was meant to be left out without content, but the rule for it never matched, so a dialog without a footer had the padding of the footer (`--el-space-4`, 16 px with the shipped themes) as extra room under its body. A footer that gets content later appears with it, and the footer of a server-rendered dialog is shown.
- Opening and closing in quick succession no longer leaves the dialog out of step with `open`. A dialog that was closed and opened again while its way out was still running stayed closed with `open` still `true`: nothing was shown, the promise of `show()` never resolved, and the next `show()` did nothing. A button that toggles the dialog and is clicked twice got there. A dialog that was opened and closed again at once kept the class of its shown state, and came in without its transition the next time. Now the last value of `open` wins: a dialog that is closed on its way in turns back, one that is opened on its way out turns round and is shown again. ([#110](https://github.com/webtides/element-library/issues/110))

## [0.1.2] - 2026-06-04

### Fixed

- The published package now ships the runtime `src/utils/transitions.js` and `src/utils/body-scroll.js` this component imports; `0.1.1` shipped only their type declarations, so importing `el-dialog` from the published package failed to resolve `../../utils/*.js`. Fixed via the root `files` allowlist (see root [`CHANGELOG.md`](../../../CHANGELOG.md)).

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-dialog` — a modal dialog built on the native `<dialog>` element. The platform provides focus trapping, background `inert`, top-layer rendering, focus restoration and `<form method="dialog">` auto-close; the component adds an animated, cancelable open/close lifecycle and ref-counted body-scroll locking that compensates for the removed scrollbar width (no layout shift on open).
- Properties `open` (reflected), `label`, `no-header` (reflected) and `close-label`.
- Methods `show()` / `hide()` (both resolve after their transition) and `requestClose(source)`.
- Events `dialog-show`, `dialog-after-show`, `dialog-hide`, `dialog-after-hide`, the cancelable `dialog-initial-focus`, and the cancelable `dialog-request-close` (with `detail.source` of `'close-button' | 'keyboard' | 'overlay'`).
- Slots: default (body), `label`, `header-actions` and `footer` (collapses when empty).
- CSS parts `base`, `header`, `title`, `header-actions`, `close-button`, `body`, `footer`; the `open` custom state; and the `--el-dialog-width`, `--el-dialog-overlay-background` and `--el-dialog-enter-offset` tokens on top of the shared `--el-*` vocabulary.

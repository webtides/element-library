# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Added

- Initial release of `el-dialog` — a modal dialog built on the native `<dialog>` element. The platform provides focus trapping, background `inert`, top-layer rendering, focus restoration and `<form method="dialog">` auto-close; the component adds an animated, cancelable open/close lifecycle and ref-counted body-scroll locking that compensates for the removed scrollbar width (no layout shift on open). API modelled on Shoelace's `<sl-dialog>`.
- Properties `open` (reflected), `label`, `no-header` (reflected) and `close-label`.
- Methods `show()` / `hide()` (both resolve after their transition) and `requestClose(source)`.
- Events `dialog-show`, `dialog-after-show`, `dialog-hide`, `dialog-after-hide`, the cancelable `dialog-initial-focus`, and the cancelable `dialog-request-close` (with `detail.source` of `'close-button' | 'keyboard' | 'overlay'`).
- Slots: default (body), `label`, `header-actions` and `footer` (collapses when empty).
- CSS parts `base`, `header`, `title`, `header-actions`, `close-button`, `body`, `footer`; the `open` custom state; and the `--el-dialog-width`, `--el-dialog-overlay-background` and `--el-dialog-enter-offset` tokens on top of the shared `--el-*` vocabulary.

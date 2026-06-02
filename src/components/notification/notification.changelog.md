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

- Initial release of `el-notification` — an alert/notification that can be shown inline or as a transient toast (`toast()` floats it into a shared top-right stack). API modelled on Shoelace's `<sl-alert>`.
- Semantic `variant` (`default` / `primary` / `success` / `neutral` / `warning` / `danger`) with per-variant accent + default icon, optional `closable` close button, and optional auto-dismiss (`duration`, default `Infinity`) that pauses while the pointer/focus is inside.
- `show()` / `hide()` (promise-returning) and `toast()` methods; `notification-show` / `-after-show` / `-hide` / `-after-hide` events; `open` reflected attribute + custom state.
- The host is exposed as an ARIA live region — `role="alert"` (assertive) for `danger` / `warning`, `role="status"` (polite) otherwise — so toasts are announced when they appear.

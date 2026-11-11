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

- On a touch screen (`@media (any-pointer: coarse)`) the label, which is the hit area of the switch, is at least `--el-touch-target` wide and high. Before, it was as high as the switch. Unchanged on a fine pointer and without the token.

### Fixed

- The error message is announced by screen readers: it is an alert (`role="alert"`), and the switch names it in `aria-describedby` while it is shown. Before, nothing connected the message with the switch. ([#94](https://github.com/webtides/element-library/issues/94))

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-switch-field` — an on/off toggle extending `FormField`. Renders a native `<input type="checkbox">` with `role="switch"` (announced as a switch, submits with forms) behind a custom, headless-by-default track/thumb.
- `checked` property reflected to the `checked` attribute, plus a `checked` custom state on the host.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` states from `FormField`.

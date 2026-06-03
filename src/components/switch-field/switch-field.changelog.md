# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-switch-field` — an on/off toggle extending `FormField`. Renders a native `<input type="checkbox">` with `role="switch"` (announced as a switch, submits with forms) behind a custom, headless-by-default track/thumb.
- `checked` property reflected to the `checked` attribute, plus a `checked` custom state on the host.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` states from `FormField`.

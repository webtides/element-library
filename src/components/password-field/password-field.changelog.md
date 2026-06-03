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

- Initial release of `el-password-field` — a masked password input extending `InputField`. Pins the input `type` to `password` (flipping to `text` while revealed) and adds an optional show/hide reveal button.
- `passwordToggle` property (default `true`) to show/hide the reveal button, `passwordVisible` state, and a `togglePasswordVisibility()` method.
- Inherits the label / help / error / validation surface, the `input-change` event and the `touched` / `valid` / `invalid` states from `InputField` / `FormField`.
- All three shipped themes decorate `el-password-field`'s native input identically to `el-input-field` (border, padding, focus ring, invalid state), so themed password and text fields match.

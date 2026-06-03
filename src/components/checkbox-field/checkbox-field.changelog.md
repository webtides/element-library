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

- `checked` custom state on the host. Style with `el-checkbox-field:state(checked) { … }`. The reflected `checked` attribute is unchanged. Inherits the `touched / valid / invalid` states from `FormField`.

### Fixed

- The native `<input type="checkbox">` is now visually hidden (kept focusable and in the accessibility tree) instead of rendering alongside the custom `.checked-indicator`, which previously showed two boxes — most visibly once a theme styled both the native control and the indicator.
- The label is no longer rendered twice: the checkbox suppresses the base `FormField` label and keeps its own inline label next to the box (`labelTemplate()` now returns `null`).
- `.checked-indicator` now has `currentColor`-based fallbacks (border + checked fill) so an unthemed checkbox still renders a usable box now that the native input is hidden; the checkmark glyph is toggled via `opacity` instead of `color: transparent`, and gains keyboard focus styling via `input:focus-visible + .checked-indicator`.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.1.1 (2021-07-21)

### Changed

update element-js version

## [0.1.1] - 2020-08-13

### Fixed

- wrong package dependency to @webtides/form-field

## [0.1.0] - 2020-03-15

### Added

- initial release

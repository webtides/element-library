# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

<!-- ### Added -->

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the plus and minus buttons are at least `--el-touch-target` wide, and the input is as high as the buttons. With the default theme the buttons were 33 and 29 px wide and the input 34 px high. The height of the buttons follows the token on every pointer, as before. Unchanged on a fine pointer and without the token.
- The `label` is rendered: a `<label>` above the stepper, inside the shadow root, that names the number input. Style it with `::part(label)`. Before, the field took the attribute and showed nothing, and the input had no accessible name (axe `label`). ([#94](https://github.com/webtides/element-library/issues/94))

<!-- ### Removed -->
<!-- ### Fixed -->

## [0.1.0] - 2026-06-03

### Changed

- Migrated into the single-repo `@webtides/element-library` package. No API changes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.1.1 (2021-07-21)

### Changed

update element-js version

## [0.1.0] - 2020-10-07

### Added

- Basic amount-field
- initial release

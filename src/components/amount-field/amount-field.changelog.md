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
- The label, the help message, the stepper and the error message stack in a column with a gap of `--el-space-1`, as in every field. The field is a flex container for that (`display: flex`; it was `inline`), and the `hidden` attribute hides it as before. With a theme, a field without messages measures what it did. Without a theme the label is 4 px above the stepper; it had no gap there. ([#131](https://github.com/webtides/element-library/issues/131))

<!-- ### Removed -->

### Fixed

- The `helpMessage` and the `errorMessage` are rendered. The field took both and showed neither, and the `aria-describedby` of its input named an element that did not exist. The help message stands between the label and the stepper. The error message is shown below the stepper while the field is touched and not valid, as an alert (`role="alert"`). The input names the help message in `aria-describedby`, and the error message while it is shown. Both have the look of the messages of every field: `--el-font-size-sm`, the muted and the danger colour of the theme, the colour of the text without one. Style them with `::part(help-message)` and `::part(error-message)`. ([#131](https://github.com/webtides/element-library/issues/131))
- The input says whether the field is valid (`aria-invalid`). Before, the error message reached a screen reader and the state of the control did not, while the control of `el-input-field` and of `el-select-field` has said it all along. ([#134](https://github.com/webtides/element-library/issues/134))

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

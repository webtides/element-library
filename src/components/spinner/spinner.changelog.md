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

- Initial `el-spinner`: a spinner for a wait of unknown length, on its own, for a section or a page that is loading. A ring with a quarter that turns, exposed as a progress bar without a value (`role="progressbar"`) and named by `label`, "Loading" by default. ([#78](https://github.com/webtides/element-library/issues/78), [#82](https://github.com/webtides/element-library/issues/82))
- It is as large as the text it stands in (`1em`), so the font size sizes it. `size` (`small`, `medium`, `large`) steps from there by the factors of the shared size module: 0.8, 1 and 1.25. Reflected to the `size` attribute.
- The quarter that turns has the accent colour of the theme, and the text colour without a theme; the ring is a fifth of the text colour. `--el-spinner-indicator-color` and `--el-spinner-track-color` set the two.
- For a user who prefers reduced motion it turns at half the speed.

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

- Initial `el-progress-ring`: a ring that closes with the progress of a task, for a place with little room. Exposed as a progress bar (`role="progressbar"`) with its value, and named by `label`, "Progress" by default. ([#122](https://github.com/webtides/element-library/issues/122))
- `value` of `max` (default `100`) is the share of the ring that is drawn, clockwise from the top. A value outside of the range is shown as the nearest one inside. The ring moves to a new value in the duration of the theme.
- The default slot is the middle of the ring, for a short text ("45 %"), set in figures of one width. It is not read out: the value is.
- The ring is a square of `--el-progress-ring-size` (`4rem`) with a line of `--el-progress-ring-track-width` (`0.25rem`) inside of it. The part that is drawn has the accent colour of the theme, and the text colour without a theme; the whole ring is a fifth of the text colour. `--el-progress-ring-indicator-color` and `--el-progress-ring-track-color` set the two.
- When colours are forced the whole ring is a thin line in the text colour, and the part that is drawn keeps its width in the colour of a selection.

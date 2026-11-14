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

- Initial `el-progress-bar`: a track that fills with the progress of a task, an upload, an import, the steps of a form. Exposed as a progress bar (`role="progressbar"`) with its value, and named by `label`, "Progress" by default. ([#121](https://github.com/webtides/element-library/issues/121))
- `value` of `max` (default `100`) is the share of the track that is filled. A value outside of the range is shown as the nearest one inside. The part that is filled starts where the text starts, and moves to a new value in the duration of the theme.
- `indeterminate` is the bar for a task whose progress is not known yet: it has no value, and two fifths of the track pass over it. For a user who prefers reduced motion the whole track fades and comes back instead.
- The part that is filled has the accent colour of the theme, and the text colour without a theme; the track is a fifth of the text colour. `--el-progress-bar-indicator-color`, `--el-progress-bar-track-color` and `--el-progress-bar-height` set the colours and the height.
- When colours are forced the track is drawn with a border and filled in the colour of a selection.

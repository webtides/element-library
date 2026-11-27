# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.4.0] - 2026-11-27

### Added

- Initial `el-description-list`: rows of a name and its value, for a settings page or the page of an entry. The element is the native `<dl>` (it is inside of the shadow root), and the page writes the names as `<dt>` and the values as `<dd>` into it. ([#195](https://github.com/webtides/element-library/issues/195))
- Below 30rem of its own width a name stands above its value; from 30rem the two stand side by side, with the values of all rows on one line. The list measures itself (a container query), not the viewport.
- `--el-description-list-term-width` sets the width of the column of the names. Unset, it is as wide as the longest name, and 40% of the list at most.
- A `<dd data-action>` ends its row in an action, a link or a small button: at the end of the row, in the middle of the first line of the value. A row with a button is as high as a row without one.
- A row has `--el-space-3` above and below, and a line in `--el-color-border` above every row but the first, over the whole width. The line is not a border, so a reset of the page that takes the border off every element leaves it. Where the user forces colours it is drawn in the text colour of the system.
- A long value breaks, inside of a word where it has to: the list is never wider than its place.
- The list runs no script: a server-rendered list is laid out before the element takes over, and looks the same after.

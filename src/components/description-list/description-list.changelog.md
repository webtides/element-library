# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.5.0] - 2026-11-27

### Added

- `--el-description-list-padding-block` sets the room above and below a row, and `--el-description-list-gap` the gap between a name and its value and in front of an action. Unset, they are `--el-space-3` and `--el-space-4` as before. ([#208](https://github.com/webtides/element-library/issues/208))

### Changed

- A page that gave the room back itself, with a padding for the `<dt>`, the `<dd>` and the `<dd data-action>` in a list and a margin for the `::before` of a `<dt>`, takes those rules out, the ones for a wide list as well: a padding of the page adds to the room now, and the line would be drawn a row too high. ([#208](https://github.com/webtides/element-library/issues/208))
- `--el-description-list-term-width` is the width of the names alone: the gap to the values comes after it. It was inside of that width before, so a list with the property set has its values begin one gap (`--el-space-4`) later, and its names have that much more room. Unset, nothing changes: the names and the gap take 40% of the list at most, as before. ([#208](https://github.com/webtides/element-library/issues/208))
- A `<dt>` and a `<dd>` are as high as their text, and a `<dd data-action>` as high as one line where the list is wide as well: the room of the row is around them, not in them. A background the page gives one of them covers its text, not the row. ([#208](https://github.com/webtides/element-library/issues/208))
- A list whose rows are all hidden keeps the room above its first and below its last row, which is a padding of the list. A list with nothing in it has no height, as before. ([#208](https://github.com/webtides/element-library/issues/208))

### Fixed

- The list looks the same on a page whose stylesheet takes the margin, the padding and the border off every element and off what an element generates (`*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; }`, the reset of Tailwind CSS v4). The room of a row was a padding of the `<dt>` and the `<dd>` of the page, the gap between a name and its value a padding as well, and the line was moved to its place with a margin (`::slotted`). A rule of the page wins over such a rule, whatever its specificity and its cascade layer: the rows had no room, a name stood right under the line, and the line was drawn below its place. The room is the gap between the rows of the grid and the padding of the list now, the gap a column of the grid, and the line is placed with `translate`. The list takes nothing from the margin, the padding or the border of a `<dt>` or a `<dd>`. On a page without a reset it is the same to the pixel. ([#208](https://github.com/webtides/element-library/issues/208))

## [0.4.0] - 2026-11-27

### Added

- Initial `el-description-list`: rows of a name and its value, for a settings page or the page of an entry. The element is the native `<dl>` (it is inside of the shadow root), and the page writes the names as `<dt>` and the values as `<dd>` into it. ([#195](https://github.com/webtides/element-library/issues/195))
- Below 30rem of its own width a name stands above its value; from 30rem the two stand side by side, with the values of all rows on one line. The list measures itself (a container query), not the viewport.
- `--el-description-list-term-width` sets the width of the column of the names. Unset, it is as wide as the longest name, and 40% of the list at most.
- A `<dd data-action>` ends its row in an action, a link or a small button: at the end of the row, in the middle of the first line of the value. A row with a button is as high as a row without one.
- A row has `--el-space-3` above and below, and a line in `--el-color-border` above every row but the first, over the whole width. The line is not a border, so a reset of the page that takes the border off every element leaves it. Where the user forces colours it is drawn in the text colour of the system.
- A long value breaks, inside of a word where it has to: the list is never wider than its place.
- The list runs no script: a server-rendered list is laid out before the element takes over, and looks the same after.

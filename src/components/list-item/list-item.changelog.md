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

- `--el-list-gap` sets the gap between the start, the texts, the end and the control of a row, on the list, on a row, or for the page. Unset, it is `--el-space-3` as before. ([#206](https://github.com/webtides/element-library/issues/206))

### Changed

- A page that gave the gap back itself, with a margin on what it slots into `start`, `end` and `action`, takes those rules out: a margin of the page adds to the gap now. ([#206](https://github.com/webtides/element-library/issues/206))

### Fixed

- The gap beside what is in `start`, `end` and `action` holds on a page whose stylesheet takes the margin off every element (`* { margin: 0 }`, the reset of Tailwind CSS v4). The row gave the gap to what the page slots in, as a margin (`::slotted`), and a rule of the page wins over such a rule, whatever its specificity and its cascade layer: the icon touched the title. The gap is one of the parts of the row now, and the row takes nothing from the margin, the padding or the border of what is slotted. A row without a `start` has no gap there, and a list without one in any row has no first column, as before. ([#206](https://github.com/webtides/element-library/issues/206))

## [0.4.0] - 2026-11-27

### Added

- Initial `el-list-item`: one row of an `el-list`, an item of its list (`role="listitem"`). It has a start (`start` slot), a title (default slot), a line under it (`description`), an end (`end`) and a control of its own (`action`). ([#192](https://github.com/webtides/element-library/issues/192))
- With `href` the row is a link as a whole: the title is a native link (`target` is passed on, `rel` is written with it), and its target is the whole row. A control in `action` lies on top of the link and stays a target of its own. On a touch screen a row that is a link is at least `--el-touch-target` high.
- `current` marks the current or the chosen row: `aria-current` (`"page"` on the link, `"true"` on a row without one), a tint, a bar at the start in the accent colour and a heavier title. The bar is a border, so it stays where the user forces colours.
- `mark` draws a dot in the padding at the start of the row, which does not move the texts. Its text is read in front of the title and is part of the name of the link (`mark="Unread"`).
- A long title breaks into more lines, inside of a word where it has to, so a text a user typed cannot widen the page. `truncate` cuts the title and the line under it after one line.
- The row runs no script: its link works before the element takes over, and without JavaScript in server-rendered markup.

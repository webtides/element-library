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

- Initial `el-list-item`: one row of an `el-list`, an item of its list (`role="listitem"`). It has a start (`start` slot), a title (default slot), a line under it (`description`), an end (`end`) and a control of its own (`action`). ([#192](https://github.com/webtides/element-library/issues/192))
- With `href` the row is a link as a whole: the title is a native link (`target` is passed on, `rel` is written with it), and its target is the whole row. A control in `action` lies on top of the link and stays a target of its own. On a touch screen a row that is a link is at least `--el-touch-target` high.
- `current` marks the current or the chosen row: `aria-current` (`"page"` on the link, `"true"` on a row without one), a tint, a bar at the start in the accent colour and a heavier title. The bar is a border, so it stays where the user forces colours.
- `mark` draws a dot in the padding at the start of the row, which does not move the texts. Its text is read in front of the title and is part of the name of the link (`mark="Unread"`).
- A long title breaks into more lines, inside of a word where it has to, so a text a user typed cannot widen the page. `truncate` cuts the title and the line under it after one line.
- The row runs no script: its link works before the element takes over, and without JavaScript in server-rendered markup.

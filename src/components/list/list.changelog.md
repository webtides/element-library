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

- Initial `el-list`: a list of rows, for messages, articles, files or the entries of a settings page. It is the list for assistive technology (`role="list"`, named by `label`), and every `el-list-item` slotted into it is an item of that list. ([#192](https://github.com/webtides/element-library/issues/192))
- The texts of all rows begin on one line, after the widest start of the list: the list has a column for the start and one for the rest, and a row takes them over (`subgrid`). A list without a start in any row has no first column.
- `density` (`'default'` or `'compact'`): `--el-space-3` or `--el-space-2` above and below the texts of a row.
- `appearance`: `'plain'` (the default) has no surface and reaches from edge to edge of its place; `'outlined'` and `'filled'` are the surfaces of `el-card`. Between two rows is a line in `--el-color-border`. Without a theme the list paints nothing.
- `--el-list-padding-inline` is the padding of a row at its start and its end, `--el-space-4` unset. With `0` a list in the body of an `el-card` has its rows on the line of the other content.
- The list runs no script: a server-rendered list is complete without JavaScript, and looks the same before and after the element takes over.

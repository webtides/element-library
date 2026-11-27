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

- Initial `el-splitter`: the edge between two panes that are beside each other, which the user drags to set the width of one of them. It is the control and sizes nothing itself, as a range does: `value` is the width in pixels, between `min` and `max`, and the layout around it takes it from the events. ([#182](https://github.com/webtides/element-library/issues/182))
- Dragged with a mouse, a finger and a pen. While it is dragged no text is selected, a finger does not scroll the page, and the edge keeps following the pointer over an `iframe`: it captures the pointer and covers the viewport for that time. `:state(dragging)` matches while it is dragged.
- A stop of the Tab key: the arrow keys move the edge by `step` pixels (`16` by default), `Home` and `End` take it to the least and to the greatest width. To assistive technology it is a separator with a value (`role="separator"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`) and with the name of what it sizes (`label`).
- `splitter-resize` tells of every width while the user changes it, `splitter-resize-end` of the one that stays: when the pointer lets go, and with every key. A width the page sets tells of nothing.
- `placement` is the edge of its pane the splitter is: `end` (the default, the pane is in front of it) or `start` (the pane is after it). The direction of the drag and of the arrow keys follows it, and the reading direction.
- The edge is thin, a line from `--el-color-border` and `--el-border-width` (`--el-splitter-line-width` sets another width), and takes the pointer in a wider area around it: `--el-space-2` wide, and at least `--el-touch-target` on a touch screen. Under the pointer, while it is dragged and with the keyboard focus the line is a mark in `--el-color-accent`, and the focus has a ring. The line is a border, which stays where the user forces colours and is there without a theme then.

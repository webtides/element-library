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

- Initial `el-nav-item`: one destination of an `el-nav`. A link with an icon (slot `icon`) and a short text under it, as an entry of a list. `href`, `target` and `rel` are the ones of the link. ([#179](https://github.com/webtides/element-library/issues/179))
- `current` marks the destination of the current view: the link gets `aria-current="page"`, the colour of the text instead of the muted one, a heavier text and a shape behind its icon. The shape has a border, so it stays where the user forces colours, and the weight marks the destination without a theme.
- The text is one line: what does not fit is cut with an ellipsis, and the whole text stays in the page for assistive technology.
- The `badge` slot takes a count or a dot, an `el-badge` as a rule, on the corner of the icon. It is part of the link and comes after the text, so a screen reader reads it with the name of the destination.
- On a touch screen the link is at least `--el-touch-target` wide and high.

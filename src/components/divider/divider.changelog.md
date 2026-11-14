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

- Initial `el-divider`: a line between two groups of content, the regions of a card, the entries of a menu, the controls of a toolbar. The line is a native `<hr>`, a separator to assistive technology. ([#120](https://github.com/webtides/element-library/issues/120))
- `orientation` is `horizontal` (the default) or `vertical`, reflected. A horizontal divider is as wide as its container. A vertical one is as high as the row of the flex or grid container it stands in, whatever the alignment of the row, and as high as the text in a line of text; it says so with `aria-orientation`.
- The line has the colour and the width of the borders of the theme (`--el-color-border`, `--el-border-width`), and is `1px` in a fifth of the text colour without a theme. `--el-divider-color` and `--el-divider-width` set other ones.
- It has no space around it: a margin on the element, or the gap of the layout, sets the distance to the content.
- The line is a border, so it stays when colours are forced.

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

- Initial `el-nav`: the destinations of an application as a bar for the lower edge of a phone. A navigation landmark (`<nav>`, named by `label`) with a list of `el-nav-item` links. ([#179](https://github.com/webtides/element-library/issues/179))
- Three to five destinations share the width in equal parts, however long their texts are. The bar is as high as an `el-app-bar`, and keeps that height: a text that does not fit is cut.
- In the footer of an `el-app-frame` the surface of the bar reaches the lower edge of the screen and its sides, and the destinations stay above the home indicator of a phone. The line to the content is the one of the region there. Alone, the bar keeps its destinations clear of the home indicator and of the sides itself (`env(safe-area-inset-*)`).
- A surface from `--el-color-bg` and a line to the content from `--el-color-border` and `--el-border-width`. The line is a border, which stays where the user forces colours and is there without a theme then.

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
- `layout="rail"`: the destinations below each other in a narrow column for the side of a wider screen, `--el-nav-rail-size` wide (`5rem`), with a line to the content at the side that faces it. The rail is as high as its place, and scrolls where it has more destinations than height. ([#181](https://github.com/webtides/element-library/issues/181))
- The `end` slot: a second group at the lower end of a rail, for the settings and the account. It is a list of its own, stays in view while the group at the top scrolls, and is not shown in a bar.
- `labels="false"`: the destinations show an icon alone. Their texts are off the screen and stay the names of their links, and show as tooltips for the pointer and for the focus of the keyboard, beside a rail and above a bar. The tooltips are `el-tooltip` elements in the shadow root (`::part(tooltip)`); the element imports the tooltip, and with it `@floating-ui/dom`.
- `layout="auto"`, the new default: a bar, and a rail where an `el-app-frame` has the element in the column at its side. The frame says so in a CSS property that is inherited, so the page writes the destinations once and the stylesheets decide, before any script has run. Alone, and in the footer of a frame, `auto` is the bar that was the default.
- Alone, a rail keeps its destinations clear of the top, its side and the lower edge of the screen (`env(safe-area-inset-*)`).

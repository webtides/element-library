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

- Initial `el-status-bar`: a narrow line of state at the lower edge of a tool for a desktop, with entries at its start and at its end (slot `end`), which follow the reading direction. An entry is what the page writes: a text, an icon with a name, an `el-button`, an `el-spinner` or an `el-progress-bar`. ([#180](https://github.com/webtides/element-library/issues/180))
- The bar is lower than a control, seven tenths of `--el-control-height`, with the small text of the tokens (`--el-font-size-sm`), and keeps that height whatever is in it. On a touch screen it is at least `--el-touch-target` high.
- An `el-button` in the bar is as high as the bar, plain, has its small text, and shows its focus ring inside of itself. The bar does not write to its buttons: it says all of it in CSS properties that are inherited.
- Entries that do not fit do not wrap and do not lie on each other. The entries at the start give way: their group is cut at its end, and the entries at the end stay. A button in the part that is cut shows while it has the keyboard focus.
- The bar is no live region and has no role. The page marks an entry whose change is announced (`role="status"`).
- In the footer of an `el-app-frame` the surface of the bar reaches as far as the surface of the region: to the lower edge of the screen and to its sides, while its entries stay clear of them. The line to the content is the one of the region there.
- A surface from `--el-color-bg`, text in `--el-color-fg-muted`, and a line to the content from `--el-color-border` and `--el-border-width`. The line is a border, which stays where the user forces colours and is there without a theme then.

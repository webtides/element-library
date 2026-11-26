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

- Initial `el-app-bar`: the bar at the top of a view, with a start (a button back, or the one for the navigation), a title and an end (the actions). Start and end follow the reading direction, and a region the page leaves empty takes no room. ([#178](https://github.com/webtides/element-library/issues/178))
- The title is one line: what does not fit is cut with an ellipsis, and never pushes the actions out. The whole title stays in the page for assistive technology. `heading-level` (1 to 6) makes it the heading of the view; unset, it is text.
- The buttons of the bar are plain while they have no appearance of their own; `appearance` names another one. The bar does not write to its buttons: it says the appearance in CSS properties that are inherited.
- In the header of an `el-app-frame` the surface of the bar reaches as far as the surface of the region: under the status bar and the notch of a phone and to the sides of the screen, while its content stays clear of them. The line to the content is the one of the region there.
- As high as a control and its padding, with and without a button, and at least `--el-touch-target` high on a touch screen.
- A surface from `--el-color-bg` and a line to the content from `--el-color-border` and `--el-border-width`. The line is a border, which stays where the user forces colours and is there without a theme then. The bar is no landmark and has no role.

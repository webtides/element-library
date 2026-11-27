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

- Initial `el-menu-group`: a group of entries in an `el-menu`. A group to assistive technology (`role="group"`), with `label` as its heading and its name. The heading the eye sees is not read a second time. ([#167](https://github.com/webtides/element-library/issues/167))
- A line divides a group from what is before it in the menu. A group that is the first thing in its menu has none. Where the user forces colours the line is there without a theme as well.

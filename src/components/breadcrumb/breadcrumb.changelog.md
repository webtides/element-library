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

- Initial `el-breadcrumb`: the trail from the start page to the current page. A `nav` landmark, named by `label` ("Breadcrumb" by default), that holds a list; every `el-breadcrumb-item` slotted into it is an entry of that list. ([#123](https://github.com/webtides/element-library/issues/123))
- The entries stand in a row that breaks into a second line where it does not fit. A line after the first starts with a separator.
- `--el-breadcrumb-separator`, a CSS string (`'/'` by default), is what stands between two entries. Set on the breadcrumb or for the whole page, it is the separator of every entry.
- The breadcrumb does nothing with its entries from a script, so a server-rendered trail is complete without JavaScript.

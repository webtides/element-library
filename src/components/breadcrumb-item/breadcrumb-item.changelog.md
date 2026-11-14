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

- Initial `el-breadcrumb-item`: one entry of an `el-breadcrumb`, an item of its list (`role="listitem"`). ([#123](https://github.com/webtides/element-library/issues/123))
- With `href` it is a native link (`target` is passed on, `rel` is written with it), without it is text.
- `current` marks the entry of the page the user is on: `aria-current="page"`, the text colour of the theme and a heavier weight, as text or as a link.
- Every entry but the first shows the separator in front of itself: the CSS string in `--el-breadcrumb-separator`, `'/'` by default, in the muted text colour of the theme and hidden from assistive technology.
- A link has the accent colour of the theme, the text colour without a theme, is underlined under the pointer and shows the focus ring of the theme. On a touch screen it is at least `--el-touch-target` wide and high.

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

- Initial `el-tag`: a label for one of several things that belong to something, a keyword or a filter that is set. ([#75](https://github.com/webtides/element-library/issues/75))
- `variant` (`neutral`, `brand`, `success`, `warning`, `danger`), `appearance` (`filled`, `outlined`, `plain`) and `size` (`small`, `medium`, `large`), the library's shared vocabulary, all reflected to attributes of the same name. A tag is 0.7 times as high as a control of the same size, so that it fits into a field.
- `pill` for fully rounded ends.
- `removable` renders a remove button that fires `tag-remove`. The tag does not remove itself; the page decides what removing means. The button is a native button in the tab order, named with `remove-label` ("Remove" by default) and the text of the tag: "Remove TypeScript".
- On a touch screen (`@media (any-pointer: coarse)`) the remove button is at least `--el-touch-target` wide and high.
- A tag is never wider than the place it stands in: a text that does not fit is cut off with an ellipsis.

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

- Initial `el-button-group`: a row of `el-button` that reads as one control. A group to assistive technology (`role="group"`), named by `label`. ([#124](https://github.com/webtides/element-library/issues/124))
- The buttons touch and share the border between them. The corners that face a neighbour are square, the outer corners of the row keep the radius of the buttons; the row is mirrored in a text that runs from right to left.
- Two filled buttons are divided by a line, a quarter of the text colour on the fill, which shows between two fills of one colour.
- The button that has the focus lies over its neighbours, so its focus ring is not covered.
- A button inside of a slotted element is joined as that element is, which makes the anchor of an `el-popover` a part of the row. What is in the panel of the popover is not.
- The group joins its buttons with its stylesheet alone: it runs no script on them, and a server-rendered group does not change when the elements take over.

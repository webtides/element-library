# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Changed

- A page that put the overlap back itself, with a negative margin for the buttons of a group, takes that rule out: the buttons would lie on each other by two borders. ([#206](https://github.com/webtides/element-library/issues/206))

### Fixed

- The buttons of a group lie on the border of their neighbour on a page whose stylesheet takes the margin off every element (`* { margin: 0 }`, the reset of Tailwind CSS v4). The group pulled a button over the border of the one in front of it with a negative margin of the button (`::slotted`), and a rule of the page wins over such a rule: two outlined buttons had two lines between them, and the group was wider by a border for every button after the first. The group names the width of the border in a property that inherits now (`--_el-group-overlap`), and the button pulls its control over it. ([#206](https://github.com/webtides/element-library/issues/206))

## [0.3.0] - 2026-11-17

### Added

- Initial `el-button-group`: a row of `el-button` that reads as one control. A group to assistive technology (`role="group"`), named by `label`. ([#124](https://github.com/webtides/element-library/issues/124))
- The buttons touch and share the border between them. The corners that face a neighbour are square, the outer corners of the row keep the radius of the buttons; the row is mirrored in a text that runs from right to left.
- Two filled buttons are divided by a line, a quarter of the text colour on the fill, which shows between two fills of one colour.
- The button that has the focus lies over its neighbours, so its focus ring is not covered.
- A button inside of a slotted element is joined as that element is, which makes the anchor of an `el-popover` a part of the row. What is in the panel of the popover is not.
- The group joins its buttons with its stylesheet alone: it runs no script on them, and a server-rendered group does not change when the elements take over.

# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.4.0] - 2026-11-27

### Added

- Initial `el-tree-item`: one entry of an `el-tree`, an item of its list (`role="listitem"`), with the entries below it in a list of their own. It has an icon at the start (`start` slot), its name (`label`, or the `label` slot) and a count at the end (`end`). ([#193](https://github.com/webtides/element-library/issues/193))
- With `href` the name is a native link whose target is the whole row. An entry that also has entries below it gets a button that opens and closes them, named by the name of the entry, with `aria-expanded`. Without `href`, an entry with entries below it is that button as a whole.
- `open` is the state of a branch, reflected to the attribute. The stylesheet reads the attribute: a server-rendered entry shows its entries, or hides them, from the first paint. The button, the arrow keys and `toggle()` change it and fire `tree-item-toggle`; setting `open` from a script fires nothing.
- `current` marks the entry of the page the user is on: `aria-current="page"`, a tint, a bar at the start in the accent colour and a heavier name. The bar is a border, so it stays where the user forces colours.
- A row is as wide as the tree on every level, and what stands in it is moved in by `--el-tree-indent` per level. A long name breaks, inside of a word where it has to. On a touch screen a row is at least `--el-touch-target` high, and the button of a branch that wide and high.

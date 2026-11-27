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

- Initial `el-menu-item`: one entry of an `el-menu`. A `<button>` with `role="menuitem"`, or a link with `href`, `target` and `rel`. It is out of the order of the Tab key: the menu moves the focus to it. ([#167](https://github.com/webtides/element-library/issues/167))
- `value` is what the entry stands for, for the listener of `menu-select`. Choosing an entry is a click on it, which the page can hear on the entry as well.
- `disabled`: the entry cannot be chosen. It says so (`aria-disabled`), fires no click, and the keyboard still gets to it. A link that is disabled has no address.
- The `icon` slot takes an icon in front of the text, and takes no room while it is empty.
- `variant` (reflected): `danger` shows an entry for something that cannot be undone in the colour of a danger, from the shared variants.
- The entry under the pointer and the one with the focus of the keyboard have a tint of the text colour, and the focus a ring inside of the entry, which is what shows where the user forces colours. On a touch screen an entry is at least `--el-touch-target` high.

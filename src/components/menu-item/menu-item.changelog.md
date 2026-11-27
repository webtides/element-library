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

- `type`: an entry that sets something instead of doing something. With `type="checkbox"` it is on or off (`role="menuitemcheckbox"`), with `type="radio"` it is one of several of which one is chosen (`role="menuitemradio"`). `checked` is its state, which it says (`aria-checked`), also while it is off and while it is disabled. A page could put a mark into the `icon` slot before, and a screen reader heard nothing of it: the role of an entry is inside of its shadow root. ([#205](https://github.com/webtides/element-library/issues/205))
- The state shows as a mark in front of the text, a check or a dot, in the new part `mark`. Its place is there while the entry is not checked as well, so the text does not move when the state changes. Where the user forces colours the mark has the colour of the text: the check is text, the dot is drawn with a border. ([#205](https://github.com/webtides/element-library/issues/205))
- The page sets the state: the entry does not change `checked` when it is chosen, and the menu fires `menu-select` and closes as for every entry. The state is in the server-rendered markup. ([#205](https://github.com/webtides/element-library/issues/205))

## [0.4.0] - 2026-11-27

### Added

- Initial `el-menu-item`: one entry of an `el-menu`. A `<button>` with `role="menuitem"`, or a link with `href`, `target` and `rel`. It is out of the order of the Tab key: the menu moves the focus to it. ([#167](https://github.com/webtides/element-library/issues/167))
- `value` is what the entry stands for, for the listener of `menu-select`. Choosing an entry is a click on it, which the page can hear on the entry as well.
- `disabled`: the entry cannot be chosen. It says so (`aria-disabled`), fires no click, and the keyboard still gets to it. A link that is disabled has no address.
- The `icon` slot takes an icon in front of the text, and takes no room while it is empty.
- `variant` (reflected): `danger` shows an entry for something that cannot be undone in the colour of a danger, from the shared variants.
- The entry under the pointer and the one with the focus of the keyboard have a tint of the text colour, and the focus a ring inside of the entry, which is what shows where the user forces colours. On a touch screen an entry is at least `--el-touch-target` high.

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

- Initial `el-menu`: a menu button. A button of the page in the `trigger` slot opens a list of actions, which are `el-menu-item` elements. To assistive technology it is a menu (`role="menu"`) of menu items, and the button says that it opens one and whether it is open (`aria-haspopup="menu"`, `aria-expanded`). ([#167](https://github.com/webtides/element-library/issues/167))
- A click, `Enter`, `Space` and `ArrowDown` on the button open the menu and put the focus on its first entry, `ArrowUp` on its last. In the menu the arrow keys move through the entries and around the ends, `Home` and `End` go to the first and to the last, and a letter goes to the next entry that starts with it.
- `Escape` closes the menu and gives the focus back to the button. The Tab key closes it and moves on, and a click beside it closes it.
- Choosing an entry closes the menu and fires `menu-select`, with the entry in `detail.item` and its `value` in `detail.value`. `menu-show` and `menu-hide` tell of the menu itself, `open` (reflected) and `:state(open)` say whether it is shown, and `show()`, `hide()` and `toggle()` open and close it from a script.
- The panel is a native popover in the top layer: nothing clips it, and it moves nothing on the page. It is placed at the button with Floating UI, at the side `placement` names (`bottom-start` by default) with a gap of `distance`, on the other side without room there, and never outside of the viewport. A long menu scrolls in what the browser shows. The menu opens and closes that popover itself (`popover="manual"`): a pointer that goes down beside it closes it, `Escape` in the menu closes it and leaves a dialog around it open, and a menu that opens closes the one before it. One the platform closes (`auto`) would be gone when the finger of a long press is lifted.
- A surface, a border and a shadow from the tokens, with the colours of the system without a theme. `--el-menu-min-width` (`10rem`) and `--el-menu-max-width` (`20rem`) bound its width. An `el-divider` in the menu is a line between two entries.
- `showAt(place, opener)`: one menu for many things, the rows of a list. It opens the menu at a point of the viewport, for a right click or a long press, with the corner of the menu at the point and the menu inside of the viewport, or at an element of the page, the button of a row, placed as at its own button. ([#186](https://github.com/webtides/element-library/issues/186))
- What the menu is opened for is its `opener`: the property while the menu is open, `detail.opener` of `menu-select`, and what gets the focus back. An open menu moves when `showAt()` is called again, and tells of both rows (`menu-hide`, `menu-show`).
- A button of the page that says that it opens a menu (`aria-haspopup="menu"`) is told whether the menu is open for it (`aria-expanded`), and gives the menu its name while it has no `label`.

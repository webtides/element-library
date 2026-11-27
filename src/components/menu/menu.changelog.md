# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Fixed

- An open menu keeps the keyboard wherever the focus is. `Escape` closes it and gives the focus back to what it was opened for, and the key does not reach the page behind; `ArrowDown` and `ArrowUp` bring the focus to its first and to its last entry; the Tab key closes it, and the focus moves on from where it is. The menu heard its keys on its panel alone: an open menu whose entries did not have the focus was left with no key, and `Escape` closed what was behind it. It hears them at the window now, for as long as it is open. ([#202](https://github.com/webtides/element-library/issues/202))
- A press on the heading of a group, on a line or on the padding of the panel leaves the focus on the entry that had it, and the arrow keys go on from there. The focus was nowhere in the page after such a press. Where no entry had the focus, the panel takes it itself: it has `tabindex="-1"`, and is no stop of the Tab key. ([#202](https://github.com/webtides/element-library/issues/202))
- The button of a row closes the menu it has opened: a second press on the element the menu is open at closes it, and it stays closed, with the listener of the readme (`menu.showAt(button)` for a click) and nothing more. The press closed the menu when the pointer went down, as a press beside it, and the click of the same press opened it again: `menu-hide`, then `menu-show`, and a button that said `aria-expanded="true"` and could not collapse what it had expanded. The menu stays open now while the pointer is down on that element, and the `showAt()` that is called with the click closes it. A call with no press before it opens the menu as before. ([#203](https://github.com/webtides/element-library/issues/203))
- A menu that is opened with `showAt()` is where it was opened while its own element is out of view, below a long list for example. It was at its own element instead, off the screen: the element was placed once before it had taken its place from `showAt()`, and that placement, which had to try the other side, was done after the right one. The panel is placed once it is shown now, and one placement at a time.
- Entries that the page renders after the menu has opened, and entries whose element is defined after it, get the focus once they are there: the first one, or the last one where `ArrowUp` has opened the menu. The menu is placed again for its new size. The focus stayed where it was, and a menu at a point kept the place of an empty panel. ([#202](https://github.com/webtides/element-library/issues/202))

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

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

- Initial `el-popover`: a panel that floats next to an anchor. A click on the anchor opens it; a second click, a click beside it or `Escape` closes it. ([#70](https://github.com/webtides/element-library/issues/70))
- Built on the native popover of the platform (`popover="auto"`): the panel is in the top layer, so nothing clips it or lies on top of it, and one popover is open at a time.
- `placement` (`top`, `bottom`, `left`, `right`, each also with `-start` or `-end`; `bottom` by default) and `distance` (8 px by default). The panel goes to the opposite side when it has no room, stays inside the viewport, and follows its anchor while it is open. The place is computed with `@floating-ui/dom`, a new dependency of the library.
- `arrow`: an arrow on the panel that points to the anchor.
- `open` (reflected, with the `open` custom state), `show()`, `hide()` and `toggle()`, and the events `popover-show` and `popover-hide`.
- The anchor gets `aria-expanded`. `Escape` gives the focus back to the anchor when it was inside the panel.

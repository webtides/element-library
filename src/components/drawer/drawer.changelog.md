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

- Initial `el-drawer`: a panel that slides in from an edge of the viewport and lies over the page, for a navigation, a filter or the details of a row. It is `el-dialog` at another place: a modal on the native `<dialog>` element, so the platform keeps the focus inside, makes the page behind it `inert`, renders it in the top layer and gives the focus back when it closes. ([#73](https://github.com/webtides/element-library/issues/73))
- `placement` (`start`, `end`, `top` or `bottom`; `end` by default, reflected): the edge the drawer lies along and slides in from. `start` and `end` are the ends of a line of text, so they swap in a right-to-left page. A drawer at the start or the end goes from the top to the bottom, one at the top or the bottom goes across the viewport.
- `--el-drawer-size`: the width of a drawer at the start or the end (`25rem` without it), the height of one at the top or the bottom (the height of its content without it). The drawer is never larger than the viewport.
- What `el-dialog` has, under the names of the drawer: `open` (reflected, with the `open` custom state), `label`, `no-header`, `close-label`; `show()` and `hide()`, which resolve once the drawer has slid in or out, and `requestClose(source)`; the events `drawer-show`, `drawer-after-show`, `drawer-hide`, `drawer-after-hide`, `drawer-initial-focus` and the cancelable `drawer-request-close` for the close button, `Escape` and a click on the backdrop; the slots `label`, `header-actions` and `footer`; the parts `base`, `header`, `title`, `header-actions`, `close-button`, `body` and `footer`.
- A form with `method="dialog"` inside the drawer closes it when it is submitted, as in `el-dialog`, and without `drawer-request-close`. ([#111](https://github.com/webtides/element-library/issues/111))
- The page does not scroll while a drawer is open. The lock is the one of `el-dialog`, so the two work together.
- The surface takes its colours and its shadow from the tokens, with a border on the edge that faces the page and square corners. The backdrop is the one of the dialog (`--el-dialog-overlay-background`). The slide takes `--el-duration-md`; a user who prefers reduced motion gets none.

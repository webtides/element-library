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

- `href`: the address of a page, with `{page}` in the place of its number (`/notes?page={page}`). With it the pages, the page before and the page after are links, in the server-rendered markup as well: a list that is rendered a page at a time is paged without JavaScript, a page opens in a new tab, and its address can be copied. Without it the pagination is buttons, as before. ([#189](https://github.com/webtides/element-library/issues/189))
- The current page is a link to its own address with `aria-current="page"`. On the first page the way back, and on the last one the way on, is a link without an address: no stop of the Tab key, and announced as a link that is not available (`role="link"`, `aria-disabled="true"`).
- A link fires no `pagination-change` and does not set `page`: the address brings the next page. The parts, the sizes, the focus ring and the touch targets are the ones of the buttons.

## [0.3.0] - 2026-11-17

### Added

- Initial `el-pagination`: the way through a list that is split into pages. A `nav` landmark with a button per page, the current one marked with `aria-current="page"`, and a button for the page before and the page after. ([#80](https://github.com/webtides/element-library/issues/80))
- `page`, `total` and `per-page` say where in the list the page is; the read-only `pages` is the number of pages. A page that does not exist is shown as the nearest one that does.
- `siblings` and `boundaries`: how many pages are shown around the current one and at both ends. The pages in between make way for an ellipsis, and the row has the same number of places on every page.
- `pagination-change` with the new page in `detail.page`, fired when a button has changed the page.
- The focus follows the page: it is on the button of the page that was chosen, wherever that stands in the new row, and stays on an arrow button until it reaches the end.
- `size` (`small`, `medium`, `large`), reflected. The buttons are squares of the control height of the size, and at least `--el-touch-target` on a touch screen.
- `label`, `page-label`, `previous-label` and `next-label` for the names in another language, and the slots `previous-icon` and `next-icon`.
- With forced colours the current page has the colours of a selection; the arrow heads turn with the reading direction.

### Fixed

- Without a theme the keyboard focus of the current page shows on every page: a ring around it in the text colour of the other buttons, `--el-color-fg` or the text colour of the page. Before, the ring had the colour of the text on the fill of the current page, a white ring on a white page. The ring of the other buttons, and every ring with `--el-color-focus-ring`, is as it was. Where the user forces colours, the ring of the current page has a colour of the system, with a theme as well. ([#160](https://github.com/webtides/element-library/issues/160))

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

- Initial `el-pagination`: the way through a list that is split into pages. A `nav` landmark with a button per page, the current one marked with `aria-current="page"`, and a button for the page before and the page after. ([#80](https://github.com/webtides/element-library/issues/80))
- `page`, `total` and `per-page` say where in the list the page is; the read-only `pages` is the number of pages. A page that does not exist is shown as the nearest one that does.
- `siblings` and `boundaries`: how many pages are shown around the current one and at both ends. The pages in between make way for an ellipsis, and the row has the same number of places on every page.
- `pagination-change` with the new page in `detail.page`, fired when a button has changed the page.
- The focus follows the page: it is on the button of the page that was chosen, wherever that stands in the new row, and stays on an arrow button until it reaches the end.
- `size` (`small`, `medium`, `large`), reflected. The buttons are squares of the control height of the size, and at least `--el-touch-target` on a touch screen.
- `label`, `page-label`, `previous-label` and `next-label` for the names in another language, and the slots `previous-icon` and `next-icon`.
- With forced colours the current page has the colours of a selection; the arrow heads turn with the reading direction.

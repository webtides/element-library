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

- On a phone whose page reaches under the notch and the home indicator (`viewport-fit=cover`), a toast could lie under them. The distance of the stack from an edge (`--el-toast-inset`) is on top of the room the system takes there now, and the stack is no wider than what is between the two sides. Elsewhere nothing changes. ([#183](https://github.com/webtides/element-library/issues/183))

## [0.3.0] - 2026-11-17

### Added

- Initial `el-toast`: the region of a page where toasts appear. A toast is an `el-notification`; the region gives it its place at an edge of the viewport and puts several of them into a stack. ([#72](https://github.com/webtides/element-library/issues/72))
- `toast(message, options)`, as a method of the element and as a function of the module: shows a text, a node or an `el-notification` as a toast and returns the notification. A text or a node becomes a notification that can be closed and leaves after five seconds; `variant`, `duration`, `closable` and `closeLabel` change that. The function uses the first `el-toast` of the document and adds one when there is none.
- `placement` (`top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`), reflected. Start and end follow the reading direction. `--el-toast-inset` is the distance from the edges.
- `max`: no more than that many toasts show at once. The rest wait in the order they came and are shown when a place is free.
- While it has toasts the region is a native popover in the top layer, above everything of the page. Without toasts it is not shown. It lets the pointer through beside and between its toasts.
- The stack is a landmark with the name in `label`. A toast that has left is taken out of the page.

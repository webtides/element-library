# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.3.0] - 2026-11-17

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the label, which is the hit area of the switch, is at least `--el-touch-target` wide and high. Before, it was as high as the switch. Unchanged on a fine pointer and without the token.
- The help message, the switch with its label and the error message stack in a column with a gap of `--el-space-1` (4 px without a theme; they had no gap), and the messages are set in `--el-font-size-sm` (14 px without a theme; they had the size of the text), as in every field now. A help message without a text takes no room. ([#130](https://github.com/webtides/element-library/issues/130))
- The help message stands below the switch and its label, and the error message below the help message. It was the first thing of the field, above the label it explains. What a screen reader reads is unchanged: the switch names both messages in `aria-describedby`. ([#132](https://github.com/webtides/element-library/issues/132))

### Fixed

- The error message is announced by screen readers: it is an alert (`role="alert"`), and the switch names it in `aria-describedby` while it is shown. Before, nothing connected the message with the switch. ([#94](https://github.com/webtides/element-library/issues/94))
- The `hidden` attribute hides the field. The field sets a `display` of its own, which won over the attribute. ([#130](https://github.com/webtides/element-library/issues/130))
- The switch says whether the field is valid (`aria-invalid`). Before, the error message reached a screen reader and the state of the control did not, while the control of `el-input-field` and of `el-select-field` has said it all along. ([#134](https://github.com/webtides/element-library/issues/134))
- A second field with the same `name` on the page is described by its own messages. Their ids are made per field, not from the name (BREAKING for a page that names `<name>-help-message` itself). See `form-field`. ([#133](https://github.com/webtides/element-library/issues/133))
- A click is reported once. `input-change` was fired three times for the first click on a switch without a `value`, and twice for every other click: by the handler of the form field, by the watcher of `value`, which took over the value of the control, and by the watcher of `checked`. The watcher of `checked` alone reports now, once for every change of the on/off state, by the user or by a script, with the value of the control as before. A `value` that a script sets is no change of the on/off state and is no longer reported. ([#148](https://github.com/webtides/element-library/issues/148))

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-switch-field` — an on/off toggle extending `FormField`. Renders a native `<input type="checkbox">` with `role="switch"` (announced as a switch, submits with forms) behind a custom, headless-by-default track/thumb.
- `checked` property reflected to the `checked` attribute, plus a `checked` custom state on the host.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` states from `FormField`.

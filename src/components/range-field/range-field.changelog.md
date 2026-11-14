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

- Initial `el-range-field`: a number from a span, picked with a thumb on a track. A native `<input type="range">` with the label, the help message, the error message and the layout of every field; it is submitted with its form by the control. ([#136](https://github.com/webtides/element-library/issues/136))
- `min`, `max` and `step` are the span and reach the control (`0`, `100` and `1` by default; `step="any"` takes every value). `value` is the text the form submits.
- A field without a `value` takes over the value of the control, the middle of the span, and so does a field whose value does not fit the span or a step. `value` says what the form submits.
- `value` follows the thumb while it moves; `input-change` reports every value once. A value set from a script moves the thumb, also after the user has moved it.
- `show-value` shows the value beside the control. It keeps the room of the longest value of the span, and it is hidden from a screen reader, which reads the value from the control.
- The control keeps the look of the browser. With `styles/native.css` it is as wide as the field, has the accent colour of the theme and shows keyboard focus with the ring of the theme. On a touch screen it is at least `--el-touch-target` high.

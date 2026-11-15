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

- Initial `el-date-field`: a date, a time or both, entered in the control of the browser and picked in its picker. An `el-input-field` with the `type` `date` (the default), `time`, `datetime-local`, `month` or `week`, so it has the label, the messages, `required`, the sizes and the place in a form of an input field. ([#146](https://github.com/webtides/element-library/issues/146))
- `min`, `max` and `step` reach the control: the earliest and the latest value, and the distance between two values. A value outside of them is not valid, and the field shows its error message once it is touched, or when the browser refuses to submit the form.
- `value` is text in the format of the control (`2026-11-15`, `14:30`, `2026-11-15T14:30`, `2026-11`, `2026-W46`). A value in another format is empty for the control, and the field takes that over: `value` says what the form submits.
- `value` follows what the user enters by keyboard and picks in the picker, and `input-change` reports each value once.
- The field writes to its control only what has changed. The control of a date drops a date that is half entered when its value, its limits or its step are written again, with the same text as well.
- With `styles/native.css` the control has the look and the three sizes of the input of `el-input-field`. The picker is drawn by the browser.

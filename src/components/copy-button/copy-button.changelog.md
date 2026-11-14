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

- Initial `el-copy-button`: a button that copies a text to the clipboard and says whether that worked. A native `<button>` that shows an icon and is named by `label`, "Copy" by default. ([#125](https://github.com/webtides/element-library/issues/125))
- The text is `value`, or with `from` the content of the element with that id: its `value` if it has one, its text without the white space around it otherwise. The element is read at the moment of the press.
- After a press the icon shows the outcome for `feedback-duration` milliseconds (`1500` by default), a check mark in the success colour or a cross in the danger colour, and a live region tells a screen reader (`success-label`, `error-label`). `status` is `success`, `error` or `idle`, reflected.
- `copy-button-copy` is fired with the text when it was copied, `copy-button-error` with the reason when it could not be: there was nothing to copy, the page has no clipboard, or the browser refused. `copy()` does the same from a script.
- `size` is `small`, `medium` or `large`, reflected: a square of the control height of the size, and at least `--el-touch-target` on a touch screen. `disabled` disables it.
- The slots `copy-icon`, `success-icon` and `error-icon` take other icons.

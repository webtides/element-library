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

- `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<textarea>`, in server-rendered markup and on every render. Set them as attributes or properties on the element; one that is not set is left out on the `<textarea>`. Before, the field dropped them.

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the textarea is at least `--el-touch-target` high, which matters for `rows="1"`, and the clear cross of an invalid field at least that wide and high (9 × 18 px before). Unchanged on a fine pointer and without the token.

<!-- ### Removed -->

### Fixed

- A server-rendered `el-textarea-field` shows its value before its JavaScript runs, and without JavaScript. The value is now rendered as the content of the `<textarea>`; before, it was written as a `value` attribute, which a textarea does not have, so the field stayed empty and submitting the form sent an empty text. Known limit: a line break at the very start of the value is missing until the element has started, because the HTML parser drops a line break that directly follows `<textarea>`.
- A re-render no longer overwrites text typed since the last change the field has seen. Before, every render wrote `value` back into the control: a required field renders right after it gets the focus, and text that arrived then was gone. ([#100](https://github.com/webtides/element-library/issues/100))
- `value` follows the textarea on every `input`. Text that arrives without a key going up is the value of the field at once and is reported with `input-change`: a paste with the mouse, dictation, a suggestion of an on-screen keyboard, a script that fills the field. Before, the field read the textarea on `keyup` and `change` only: it did not know such text until the field was left, and a required field counted as not valid for that long. ([#100](https://github.com/webtides/element-library/issues/100))
- The mark of a touched field (✓ or ✗) stands beside the textarea, at its top, and has the colours it has beside an input (`--el-color-success`, `--el-color-danger`). Before, it was a line of its own below the textarea: the field grew by that line when it was left for the first time, and what came after it moved down. A click on a button below the field was lost that way, when the button moved away between the press and the release. A textarea that is as wide as the field gets narrower by the mark and the gap. On a touch screen the mark has the width of `--el-touch-target` in both states, so the textarea keeps its width when the validity changes. ([#101](https://github.com/webtides/element-library/issues/101))
- `aria-describedby` on the textarea now names the help message (`<name>-help-message`). It pointed at `<name>-help`, an id that does not exist.
- The error message is announced by screen readers: it is an alert (`role="alert"`), and the textarea names it in `aria-describedby` while it is shown. Before, nothing connected the message with the textarea. ([#94](https://github.com/webtides/element-library/issues/94))
- The cross of a field that is not valid empties `value` as well, reports it with `input-change`, and `valid` follows the empty textarea. Before, only the textarea was emptied. See `form-field`. ([#115](https://github.com/webtides/element-library/issues/115))
- The error message has the danger colour of the theme (`--el-color-danger`). It had the colour of the text and read like a help message, while the messages of an `el-input-field` on the same form were red. Without a theme it keeps the colour of the text, which is what every field does now. ([#128](https://github.com/webtides/element-library/issues/128))

## [0.1.0] - 2026-06-03

### Changed

- Migrated into the single-repo `@webtides/element-library` package. No API changes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

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

### Added

- Initial `el-combobox-field`: a text the user writes, with suggestions the browser offers while they type. An `el-input-field` with a native `<datalist>`, so it has the label, the messages, `required`, `pattern`, the sizes and the place in a form of an input field. ([#145](https://github.com/webtides/element-library/issues/145))
- `options` are the suggestions: plain strings, or `{ value, label }`. The field renders them as a list with an id of its own and names it on the control. Options that change reach the list, for suggestions a page loads while the user types.
- Without options there is no list, and the control is a plain text input, also for a screen reader.
- The value is free text: a suggestion is an offer, not a limit. `value` follows what is typed and what is picked, and `input-change` reports it.
- With `styles/native.css` the input has the look and the three sizes of the input of `el-input-field`. The list of the suggestions is drawn by the browser.

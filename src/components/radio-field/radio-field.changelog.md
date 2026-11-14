# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the label of every option, which is its hit area, is at least `--el-touch-target` wide and high. Before, it was as high as its line of text. Unchanged on a fine pointer and without the token.
- The legend, the help message, the options and the error message stack in a column with a gap of `--el-space-1` (4 px without a theme). Before, only the legend had that distance to what follows, and none without a theme. The messages are set in `--el-font-size-sm` (14 px without a theme; they had the size of the text), as in every field now. A help message without a text takes no room. ([#130](https://github.com/webtides/element-library/issues/130))

### Fixed

- The error message is announced by screen readers: it is an alert (`role="alert"`), and the group, like each of its radios, names it in `aria-describedby` while it is shown. Before, the group pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- The `hidden` attribute hides the field. The field sets a `display` of its own, which won over the attribute. ([#130](https://github.com/webtides/element-library/issues/130))

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-radio-field` — a single-choice radio group extending `FormField`. Renders a native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s (native grouping, arrow-key navigation and form submission) with a custom, headless-by-default circular indicator.
- `options` property accepting plain strings or `{ value, label?, disabled? }` objects (mirrors `el-select-field`); `value` reflects the selected option.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` custom states from `FormField`.

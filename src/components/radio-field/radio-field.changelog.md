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

- On a touch screen (`@media (any-pointer: coarse)`) the label of every option, which is its hit area, is at least `--el-touch-target` wide and high. Before, it was as high as its line of text. Unchanged on a fine pointer and without the token.
- The legend, the help message, the options and the error message stack in a column with a gap of `--el-space-1` (4 px without a theme). Before, only the legend had that distance to what follows, and none without a theme. The messages are set in `--el-font-size-sm` (14 px without a theme; they had the size of the text), as in every field now. A help message without a text takes no room. ([#130](https://github.com/webtides/element-library/issues/130))

### Fixed

- The error message is announced by screen readers: it is an alert (`role="alert"`), and the group, like each of its radios, names it in `aria-describedby` while it is shown. Before, the group pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- The `hidden` attribute hides the field. The field sets a `display` of its own, which won over the attribute. ([#130](https://github.com/webtides/element-library/issues/130))
- A second field with the same `name` on the page is described by its own messages. Their ids are made per field, not from the name (BREAKING for a page that names `<name>-help-message` itself). See `form-field`. ([#133](https://github.com/webtides/element-library/issues/133))
- An error the page renders the group with is kept. A group with `valid="false"` and an error message, after a check of the page such as "that plan is sold out", showed nothing: when it connected, the group worked out its validity from `required` and its value and overwrote what the page said. It keeps the error now until the user is in the group again, as the other fields do. ([#139](https://github.com/webtides/element-library/issues/139))
- The group is touched once the user has left it. It was touched as soon as one of its radios lost the focus, also to the next radio: with the arrow keys, and with a click on another option, where a required group without a choice showed its error message for the time of the click. ([#139](https://github.com/webtides/element-library/issues/139))
- A value from a script selects its radio also after the user has chosen. The `checked` attribute of a radio is only its default, which the browser no longer follows once the user has chosen that radio: `value` said one option and the form submitted another. The choice is written to the radios after every render now. ([#139](https://github.com/webtides/element-library/issues/139))

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-radio-field` — a single-choice radio group extending `FormField`. Renders a native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s (native grouping, arrow-key navigation and form submission) with a custom, headless-by-default circular indicator.
- `options` property accepting plain strings or `{ value, label?, disabled? }` objects (mirrors `el-select-field`); `value` reflects the selected option.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` custom states from `FormField`.

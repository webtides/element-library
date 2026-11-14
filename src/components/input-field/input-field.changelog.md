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

- `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<input>`, in server-rendered markup and on every render. Set them as attributes or properties on the element; one that is not set is left out on the `<input>`. Before, the field dropped them, so a password manager and the on-screen keyboard got no hints.
- `size` (`small`, `medium` by default, `large`): the height, the padding and the font size of the control, 0.8 and 1.25 times `--el-control-height` for small and large. Reflected to the attribute. It shows once `styles/native.css` decorates the control; a control with the look of the browser keeps its size. ([#69](https://github.com/webtides/element-library/issues/69))

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the input is at least `--el-touch-target` high (42 px with the default theme before), and the clear cross of an invalid field at least that wide and high (9 × 18 px before). The mark beside the input takes that width while the field is valid too, so the input keeps its width when the validity changes. Unchanged on a fine pointer and without the token.

### Fixed

- The `hidden` attribute hides the field. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))
- The error message is announced by screen readers: it is an alert (`role="alert"`), and the input names it in `aria-describedby` while it is shown. Before, the input pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- The cross of a field that is not valid empties `value` as well, reports it with `input-change`, and `valid` follows the empty input. Before, only the input was emptied. See `form-field`. ([#115](https://github.com/webtides/element-library/issues/115))
- A value that a script sets on the element reaches the input also after the user has typed. The field renders its value as the `value` attribute of the input, which is only the default of the control: once the user had typed, the browser no longer showed it. After `x` was typed into a field with "first", `el.value = 'outside'` left "firstx" in the input and in what the form submitted, while `value` said "outside". The field now writes a value that was set from outside to the control as well, as `el-textarea-field` does. Text the user types is not written back, so the caret stays where it is. ([#126](https://github.com/webtides/element-library/issues/126))

## [0.1.0] - 2026-06-03

### Changed

- Hardcoded values in the stylesheet now reference design tokens with the previous values as fallbacks: `--el-space-1` / `--el-space-2` for gaps, `--el-color-success` / `--el-color-danger` for validity icon colors, `--el-font-size-sm` for the help/error message text.

### Fixed

- The `pattern` attribute is now omitted entirely when `pattern` is unset, via element-js's `optionalAttribute` directive. It previously fell back to a `[sS]*` regex — meant as "match anything" but actually matching only runs of `s` / `S` — which made the field report any ordinary value as invalid. The directive that allows omitting the attribute didn't exist when the fallback was introduced.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

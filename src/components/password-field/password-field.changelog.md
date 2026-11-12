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

- `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<input>`, in server-rendered markup and on every render, the one the reveal toggle triggers included. Set them as attributes or properties on the element; one that is not set is left out on the `<input>`. Before, the field dropped them, so a password manager and the on-screen keyboard got no hints. `autocomplete="current-password"` and `autocomplete="new-password"` now reach the input.
- `show-label` and `hide-label` (`showLabel`, `hideLabel`): the two accessible labels of the reveal button. Defaults `'Show password'` and `'Hide password'`, the texts that were fixed before. ([#98](https://github.com/webtides/element-library/issues/98))
- `size` (`small`, `medium` by default, `large`), as on `el-input-field`. ([#69](https://github.com/webtides/element-library/issues/69))

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the reveal button is at least `--el-touch-target` wide and high (20 × 20 px before), the input at least that high, and the clear cross of an invalid field at least that wide and high. Unchanged on a fine pointer and without the token. Known limit: when an `el-input-field` connects before the first `el-password-field` of a page, element-js gives the password field the style sheet of the input field ([element-js#198](https://github.com/webtides/element-js/issues/198)). The reveal button then has none of its styles, this size included.

### Fixed

- The field has its own styles when an `el-input-field` is on the page before it. Before, it took over the stylesheet of the input field in that order and lost its own: the reveal button looked like a native button, with a border and a background. See `form-field`.
- The error message is announced by screen readers: it is an alert (`role="alert"`), and the input names it in `aria-describedby` while it is shown. Before, the input pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- The `hidden` attribute hides the field. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))

## [0.1.0] - 2026-06-03

### Added

- Initial release of `el-password-field` — a masked password input extending `InputField`. Pins the input `type` to `password` (flipping to `text` while revealed) and adds an optional show/hide reveal button.
- `passwordToggle` property (default `true`) to show/hide the reveal button, `passwordVisible` state, and a `togglePasswordVisibility()` method.
- Inherits the label / help / error / validation surface, the `input-change` event and the `touched` / `valid` / `invalid` states from `InputField` / `FormField`.
- All three shipped themes decorate `el-password-field`'s native input identically to `el-input-field` (border, padding, focus ring, invalid state), so themed password and text fields match.

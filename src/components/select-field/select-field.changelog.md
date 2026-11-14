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

- On a touch screen (`@media (any-pointer: coarse)`) the select is at least `--el-touch-target` high (42 px with the default theme before). Unchanged on a fine pointer and without the token.

### Fixed

- `value` selects its option. `<el-select-field value="b" options='["a","b","c"]'>` showed and submitted `a`, and a value set later changed nothing: the template wrote `value` onto the `<select>`, which has no such attribute. The option of the value now carries `selected`, in server-rendered markup as well, and a value that is set later selects its option, also after the user has chosen. `value` wins over an option marked as `selected` in `options`, which is the default of a field without a value. ([#104](https://github.com/webtides/element-library/issues/104))
- `value` says what is selected. A field without a value takes over what the select shows, the option marked as `selected` or else the first one; before, `value` stayed `null` until the user chose, while the form already submitted that option. No `input-change` is fired for it. While the placeholder is shown, `value` stays `null`. ([#104](https://github.com/webtides/element-library/issues/104))
- The error message is announced by screen readers: it is an alert (`role="alert"`), and the select names it in `aria-describedby` while it is shown. Before, the select pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- A decorated select shows its chevron wherever the theme is loaded. The theme showed the field's own chevron with a rule of the same weight as the rule of the field that hides it, so the later one won: with the theme in the stylesheet of the page and the styles of the field after it, the select had no chevron at all, the native one taken away and its own hidden. The field now follows a property that `styles/native.css` sets. ([#69](https://github.com/webtides/element-library/issues/69))

## [0.1.0] - 2026-06-03

### Changed

- BREAKING: renamed the dropdown indicator's CSS class from `.icon` to `.dropdown-indicator` to avoid collisions with generic consumer styles.
- The `.dropdown-indicator` now renders an SVG chevron (inheriting `currentColor`) instead of the `&or;` text glyph, for a crisp, consistent caret. Still hidden by default and shown/positioned by the themes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.0] - 2024-06-18

### Added

- initial release

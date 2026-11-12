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

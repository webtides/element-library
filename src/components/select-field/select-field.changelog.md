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

- BREAKING: renamed the dropdown indicator's CSS class from `.icon` to `.dropdown-indicator` to avoid collisions with generic consumer styles.
- The `.dropdown-indicator` now renders an SVG chevron (inheriting `currentColor`) instead of the `&or;` text glyph, for a crisp, consistent caret. Still hidden by default and shown/positioned by the themes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.0] - 2024-06-18

### Added

- initial release

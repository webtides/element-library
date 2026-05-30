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

- `open` custom state on the host. Style with `:host(:state(open))` or `el-accordion:state(open)` from outside.

### Changed

- BREAKING: renamed the component — tag `el-accordion-element` → `el-accordion`, import subpaths `@webtides/element-library/accordion-element` → `/accordion` (and `/accordion-element/define` → `/accordion/define`), and exported class `AccordionElement` → `Accordion`.
- BREAKING: renamed CSS parts `title-wrapper` → `title` and `content-wrapper` → `content` for consistency with the rest of the library (carousel, slider, amount-field). The internal `.content-wrapper` class is now `.content`.
- BREAKING: replaced the separate `open-icon` / `close-icon` parts with a single `icon` part — one SVG chevron that rotates 180° when open (animated with `--el-duration-md` / `--el-ease`) instead of swapping two `&vee;` / `&wedge;` text glyphs.
- Internal style now keys off `:host(:state(open))` instead of `:host([open='true'])`. The reflected `open` attribute is unchanged.
- Expand/collapse transition reads `--el-duration-md` and `--el-ease` (with the previous `0.3s ease-out` as fallback).

### Fixed

- Collapsed content no longer leaves a visible sliver. The content padding moved from `.content` (which collapses to `height: 0`) onto a new inner `.content-inner` wrapper, so closing the accordion now also clips the padding. Previously only noticeable once a theme set `--el-space-3`.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

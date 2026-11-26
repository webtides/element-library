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

- Where scripting is off, a server-rendered accordion without `open="true"` is closed and cannot be opened; it was open before, because nothing had collapsed it. The readme has a rule for a page that wants the content readable there (`@media (scripting: none)` and the `content` part). ([#187](https://github.com/webtides/element-library/issues/187))

### Fixed

- A closed accordion that was rendered on the server shows its header alone from the first paint. The markup of the server had the content as it is while open, the browser painted it, and the element took it away once it started: everything below the accordion jumped up with every page load, and where scripting is off the accordion was open. The stylesheet of the element now collapses the content unless the host has `open="true"`, which holds before the element starts. An accordion with `open="true"` is server-rendered open, with the line under its header and the turned chevron, and stays that way. ([#187](https://github.com/webtides/element-library/issues/187))
- A closed accordion that is rendered in the browser starts closed. It was rendered open and collapsed with the transition, in front of the user and with the content below it moving. ([#187](https://github.com/webtides/element-library/issues/187))

## [0.3.0] - 2026-11-17

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the header is at least `--el-touch-target` high. With the default and the sketchy theme it already was; with the high-contrast theme it was 46 px with a target of 48 px. Unchanged on a fine pointer and without the token.

### Fixed

- `collapse()` no longer throws `Cannot read properties of undefined (reading 'style')` when the accordion is removed from the DOM before its two animation frames have run (for example a closed accordion that is connected and removed again right away). The content node is now captured up front instead of being read from `$refs` inside the frames, which element-js clears on disconnect.

## [0.1.0] - 2026-06-03

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

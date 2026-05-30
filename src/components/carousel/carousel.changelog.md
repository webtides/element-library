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

- BREAKING: renamed the component — tag `el-carousel-element` → `el-carousel`, import subpaths `@webtides/element-library/carousel-element` → `/carousel` (and `/carousel-element/define` → `/carousel/define`), and exported class `CarouselElement` → `Carousel`.

### Fixed

- The shadow-DOM `Html` component (`ShadowHtml`) now forwards Glide's `Events` argument to the wrapped `@glidejs/glide` html component, matching the sibling `ShadowAnchors` / `ShadowClones` / `ShadowGaps` wrappers. Previously it called the factory with only `(Glide, Components)`, so the underlying component's `Events.on('update', …)` threw `Cannot read properties of undefined (reading 'on')` on every mount.
- Glide's core + theme CSS is now inlined in `carousel.style.js` instead of being pulled in with `@import '@glidejs/glide/dist/css/…'`. The `@import` was silently dropped because element-js applies component styles as constructed/adopted stylesheets, where `@import` is not allowed — so `.glide__track` lost `overflow: hidden` and the arrows/bullets lost their absolute positioning and fell into a strip below the slides instead of overlaying them.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.4] - 2021-07-21

### Changed

update element-js version

## [0.1.3] - 2020-10-09

### FIXED

- fix glide dependecy

## [0.1.2] - 2020-10-09

### Added

- part marker to glide template for better themability

## [0.1.1] - 2020-09-28

### Fixed

- disabled state

## [0.1.0] - 2020-09-17

### Added

- initial release

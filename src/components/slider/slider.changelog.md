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

- `dot-label` (`dotLabel`): the accessible label of a pager dot, followed by the number of its item. Default `'Go to item'`, which names the dots "Go to item 1", "Go to item 2" and so on. ([#94](https://github.com/webtides/element-library/issues/94))

### Changed

- BREAKING: the arrows and the dots have a look and a place they share with `el-carousel`. A dot is drawn and no longer a character: a ring of 10 px in `--el-color-fg-muted`, and the one of the selected item a disc in `--el-color-accent` (they were `○` and `●` at 22 px, in `--el-color-fg` and the accent colour). A click counts in a square of 24 px around a dot, and the row of dots is 24 px high (was 33 px with the default theme). An arrow is a square of `--el-control-height` (was 41 × 40 px by its padding), `--el-space-2` in from the sides (was at the sides), in the middle of the height of the scroller (was in the middle of the slider with its dots). Left empty, an arrow shows an arrow head and is named "Previous item" or "Next item" for screen readers (it showed `⟨` or `⟩`, and that character was its name). The keyboard focus shows as a ring inside of an arrow and around a dot, from the tokens of the focus ring (it was the outline of the browser). The arrow that leads nowhere keeps its surface and its sign fades (it looked like the other one). Without a theme an arrow has the surface and the text colour of the browser for the colour scheme (it was a character without a surface). The host is a grid (`display: grid`, was `block`). The parts keep their names. A rule of the page for `::part(dot)` now meets another look: a dot is drawn with its border, so `border-color` colours it and `color` does not. ([#162](https://github.com/webtides/element-library/issues/162))
- On a touch screen (`@media (any-pointer: coarse)`) the arrows are at least `--el-touch-target` wide and high (41 × 40 px with the default theme before). The dots keep their size: each gets a hit area of `--el-touch-target` around it (the dots were 29 × 34 px), and the dots move apart by as much. The row of dots wraps when it gets wider than the slider. Unchanged on a fine pointer and without the token.

### Fixed

- The pager dots have an accessible name (see `dot-label`); they were buttons without one (axe `button-name`). The scroller can be reached with the keyboard (`tabindex="0"`), where the arrow keys scroll it (axe `scrollable-region-focusable`). ([#94](https://github.com/webtides/element-library/issues/94))

## [0.1.0] - 2026-06-03

### Changed

- BREAKING: renamed the component — tag `el-slider-element` → `el-slider`, import subpaths `@webtides/element-library/slider-element` → `/slider` (and `/slider-element/define` → `/slider/define`), and exported class `SliderElement` → `Slider`.
- Hardcoded values in the stylesheet now reference design tokens with the previous values as fallbacks: `--el-color-fg` (dot color, default `light-dark(#333, #e5e7eb)`), `--el-color-bg` (arrow button background, default `light-dark(white, #1a1a1a)`), `--el-space-1` / `--el-space-2` / `--el-space-4` for padding.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.4.15] - 2022-07-21

### Changed

- update element-js

## [0.4.14] - 2022-07-18

### Changed

- make private fields #items & #itemsCount public

## [0.4.13] - 2021-09-09

### Fixed

- canSlide getter was throwing error when called before first update

## [0.4.12] - 2021-09-08

### ADDED

- canSlide getter

### Fixed

- next() could cause an infinite loop if auoselect was on and the slider had no overflow

## [0.4.11] - 2021-09-07

### ADDED

- Resize Event for better Observation

## [0.4.10] - 2021-09-03

### Fixed

- infintie loop on next & autoselect

## [0.4.9] - 2021-09-02

### ADDED

- ResizeObserver to correct scroll positions after resize for Browsers with Scroll Snap Bugs (enabled by default)
- setIndexAfterResize Option to disable the above
- manualScrollEndDelay Option

### CHANGED

- manualScrollEnd Default Delay from 100ms to 200ms to prevent races with smooth scrolling

### Fixed

- Firefox / Safari Browser BUG after Layout SHIFT

## [0.4.8] - 2021-08-27

### Fixed

- scrollToIndex flag was never reseted as there was an early return in scroll listener. This Bug broke manualScrollEnd callback which was never executed once a button was pressed.

## [0.4.7] - 2021-07-02

### Added

- constructor options to overwrite default
- public method to (re)index children as items

## [0.4.6] - 2021-07-02

### Added

- adds initial check if initial scrollto is actually needed

## [0.4.5] - 2021-07-01

### FIXED

- maximum call stack error on autoselect when using margins for spacing

### Added

- stories for rendering slide items that wil get random dimensions after a timeout as a challenging test

## [0.4.4] - 2020-10-05

### Added

- part for disabled arrow

## [0.4.3] - 2020-09-29

### Fixed

- js error when scrollTo were called before render (externally)

## [0.4.2] - 2020-09-29

### Fixed

- initial selected index

### Added

- smooth flag to goto and scrollTo Method

## [0.4.1] - 2020-09-29

### Added

- feature flags for `dots` and `arrows`
- simple RUN to update external UI

### Fixed / Removed

- z-index from slider and ::slotted(item) css as it was bleeding into global style scope

## [0.4.0] - 2020-09-15

### Added

- `autoSelect` property. When set to `true` the slider will scroll to the next partially visible item in the direction the user wanted to go instead of only increasing/decreasing the index by one.

## [0.3.0] - 2020-09-11

### Added

- `goTo(index)` public method to control the slider from outside

### Changed

- refactored all calculations inside the slider to be more resilient
- the slider now can handle items of different widths

## [0.2.0] - 2020-09-08

### Added

- `canSlideLeft` and `canSlideRight` getter to check if arrow buttons should be shown in template

## [0.1.1] - 2020-08-26

### Added

- `--snap-align` custom property for changing the scroll-snap-align value for the scroller

## [0.1.0] - 2020-07-30

### Added

- initial release

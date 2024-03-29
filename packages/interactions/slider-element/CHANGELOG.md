# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

<!--
   PRs should document their user-visible changes (if any) in the
   Unreleased section, uncommenting the header as necessary.
-->

<!-- ## Unreleased -->
<!-- ### Added -->
<!-- ### Changed -->
<!-- ### Removed -->
<!-- ### Fixed -->

## [0.4.15] - 2022-07-21

### Changed

-   update element-js

## [0.4.14] - 2022-07-18

### Changed

-   make private fields #items & #itemsCount public

## [0.4.13] - 2021-09-09

### Fixed

-   canSlide getter was throwing error when called before first update

## [0.4.12] - 2021-09-08

### ADDED

-   canSlide getter

### Fixed

-   next() could cause an infinite loop if auoselect was on and the slider had no overflow

## [0.4.11] - 2021-09-07

### ADDED

-   Resize Event for better Observation

## [0.4.10] - 2021-09-03

### Fixed

-   infintie loop on next & autoselect

## [0.4.9] - 2021-09-02

### ADDED

-   ResizeObserver to correct scroll positions after resize for Browsers with Scroll Snap Bugs (enabled by default)
-   setIndexAfterResize Option to disable the above
-   manualScrollEndDelay Option

### CHANGED

-   manualScrollEnd Default Delay from 100ms to 200ms to prevent races with smooth scrolling

### Fixed

-   Firefox / Safari Browser BUG after Layout SHIFT

## [0.4.8] - 2021-08-27

### Fixed

-   scrollToIndex flag was never reseted as there was an early return in scroll listener. This Bug broke manualScrollEnd callback which was never executed once a button was pressed.

## [0.4.7] - 2021-07-02

### Added

-   constructor options to overwrite default
-   public method to (re)index children as items

## [0.4.6] - 2021-07-02

### Added

-   adds initial check if initial scrollto is actually needed

## [0.4.5] - 2021-07-01

### FIXED

-   maximum call stack error on autoselect when using margins for spacing

### Added

-   stories for rendering slide items that wil get random dimensions after a timeout as a challenging test

## [0.4.4] - 2020-10-05

### Added

-   part for disabled arrow

## [0.4.3] - 2020-09-29

### Fixed

-   js error when scrollTo were called before render (externally)

## [0.4.2] - 2020-09-29

### Fixed

-   initial selected index

### Added

-   smooth flag to goto and scrollTo Method

## [0.4.1] - 2020-09-29

### Added

-   feature flags for `dots` and `arrows`
-   simple RUN to update external UI

### Fixed / Removed

-   z-index from slider and ::slotted(item) css as it was bleeding into global style scope

## [0.4.0] - 2020-09-15

### Added

-   `autoSelect` property. When set to `true` the slider will scroll to the next partially visible item in the direction the user wanted to go instead of only increasing/decreasing the index by one.

## [0.3.0] - 2020-09-11

### Added

-   `goTo(index)` public method to control the slider from outside

### Changed

-   refactored all calculations inside the slider to be more resilient
-   the slider now can handle items of different widths

## [0.2.0] - 2020-09-08

### Added

-   `canSlideLeft` and `canSlideRight` getter to check if arrow buttons should be shown in template

## [0.1.1] - 2020-08-26

### Added

-   `--snap-align` custom property for changing the scroll-snap-align value for the scroller

## [0.1.0] - 2020-07-30

### Added

-   initial release

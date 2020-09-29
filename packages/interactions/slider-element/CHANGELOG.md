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

## [0.4.2] - 2020-09-29

### Fixed 
- initial selected index 
### Added
- smooth flag to goto and scrollTo Method


## [0.4.1] - 2020-09-29

### Added
-   feature flags for `dots` and `arrows`
-   simple RUN to update external UI
### Fixed / Removed 
- z-index from slider and ::slotted(item) css as it was bleeding into global style scope 


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

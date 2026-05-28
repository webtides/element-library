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

- `loaded` custom state on the host, set once the child has been swapped in. Style with `el-lazy-src:state(loaded) { … }`. The reflected `loaded` attribute is unchanged.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.2.2 (2021-07-21)

### Changed

update element-js version

## 0.2.1 (2021-12-9)

<!-- ### Added -->

api getter to return lozad instance

## 0.2.0 (2020-03-15)

<!-- ### Added -->

lozad.js as external dependecy imgClass pproperty to add CSS classes to generated imgs in picture EVENTS (LOAD, IMG_LOAD, IMG_ERROR) Tests

<!-- ### Changed -->

'src-loaded' EVENT -> LOAD

<!-- ### Removed -->

'src-loaded' EVENT

IntersectionObserver per instance Property Test

## 0.1.0 (2020-03-15)

### Added

- initial release

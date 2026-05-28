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

- BREAKING: replaced the `.is-sticky`, `.is-up`, `.is-down` host classes with the custom states `:state(sticky)`, `:state(up)`, `:state(down)`. Consumers that styled on the old class names should switch to `el-sticky-element:state(...) { … }`.
- Sticky transition reads `--el-duration-md` and `--el-ease` (with the previous `0.3s ease` as fallback).

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.2.1 (2021-07-21)

### Changed

update element-js version

## [0.2.0] - 2020-12-22

### Fixed

- Added `ResizeOberver` to listen for when the size of the `sticky-element` changes. With this it will now correctly calculate the height of the element even if it contains other custom elements that render after the connected callback.

## [0.1.0] - 2020-07-07

### Added

- initial release

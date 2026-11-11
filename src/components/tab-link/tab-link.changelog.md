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

- On a touch screen (`@media (any-pointer: coarse)`) the tab is at least `--el-touch-target` wide and high (36 px high with the default theme before). Unchanged on a fine pointer and without the token.

### Fixed

- A disabled link is exposed as disabled: the element sets `aria-disabled="true"` on itself while it has the `disabled` attribute. Before, it was only greyed out, and axe counted the reduced contrast as a failure. ([#94](https://github.com/webtides/element-library/issues/94))

## [0.1.0] - 2026-06-03

### Changed

- BREAKING: the active state is now exposed as a custom state (`:state(active)`) instead of the `[active]` attribute. `<el-tab-group>` toggles it on each link as the selection changes. Consumers should use `el-tab-link:state(active) { … }`.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-11-10

### Added

- initial release

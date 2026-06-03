# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

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

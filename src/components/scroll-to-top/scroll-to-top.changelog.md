# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.4.0] - 2026-11-27

### Changed

- It scrolls the element around it that scrolls to the top, the content of an `el-app-frame` for example, and the window where there is none. Before, it scrolled the window whatever it was in. `duration` is ignored when that element has `scroll-behavior: smooth`. ([#176](https://github.com/webtides/element-library/issues/176))

## [0.1.0] - 2026-06-03

### Changed

- Migrated into the single-repo `@webtides/element-library` package. No API changes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.1.1 (2021-07-21)

### Changed

update element-js version

## 0.1.0 (2020-03-15)

### Added

- initial release

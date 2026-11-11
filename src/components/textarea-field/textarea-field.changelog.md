# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

<!-- ### Added -->
<!-- ### Changed -->
<!-- ### Removed -->

### Fixed

- A server-rendered `el-textarea-field` shows its value before its JavaScript runs, and without JavaScript. The value is now rendered as the content of the `<textarea>`; before, it was written as a `value` attribute, which a textarea does not have, so the field stayed empty and submitting the form sent an empty text. Known limit: a line break at the very start of the value is missing until the element has started, because the HTML parser drops a line break that directly follows `<textarea>`.
- A re-render no longer overwrites text typed since the last change the field has seen. Before, every render wrote `value` back into the control.
- `aria-describedby` on the textarea now names the help message (`<name>-help-message`). It pointed at `<name>-help`, an id that does not exist.

## [0.1.0] - 2026-06-03

### Changed

- Migrated into the single-repo `@webtides/element-library` package. No API changes.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

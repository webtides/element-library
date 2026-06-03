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

### Added

- Initial release of `el-radio-field` — a single-choice radio group extending `FormField`. Renders a native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s (native grouping, arrow-key navigation and form submission) with a custom, headless-by-default circular indicator.
- `options` property accepting plain strings or `{ value, label?, disabled? }` objects (mirrors `el-select-field`); `value` reflects the selected option.
- Inherits the `input-change` event and `touched` / `valid` / `invalid` custom states from `FormField`.

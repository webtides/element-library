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

- `touched`, `valid` and `invalid` custom states on the host. Inherited by all subclasses (`InputField`, `CheckboxField`, `TextareaField`, `AmountField`, `SelectField`). The inner `.field.is-touched / .is-valid / .is-invalid` classes still exist; they remain the internal hook for event delegation and shadow-DOM rendered subclasses.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.1.1 (2021-07-21)

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

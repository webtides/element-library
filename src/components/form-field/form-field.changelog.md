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

- The readme says how the fields take part in a native `<form>` ("In a form"): what is submitted, what `disabled` and `required` do, and what does not work yet. Every statement there is covered by a test of the field. ([#69](https://github.com/webtides/element-library/issues/69))

### Fixed

- The error message is announced by screen readers. It is an alert now (`role="alert"`), so it is read the moment it appears, and the fields name it in the `aria-describedby` of their control while it is shown, so it is read again when the control gets focus. Before, a control pointed at the message with `aria-errormessage` at most, which few screen readers read and which axe reports (`aria-valid-attr-value`). The alert reaches every field that shows the message; `aria-describedby` is set by `el-input-field`, `el-password-field`, `el-select-field`, `el-radio-field`, `el-textarea-field` and `el-switch-field`. ([#94](https://github.com/webtides/element-library/issues/94))

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

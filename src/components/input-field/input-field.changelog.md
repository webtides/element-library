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

- `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<input>`, in server-rendered markup and on every render. Set them as attributes or properties on the element; one that is not set is left out on the `<input>`. Before, the field dropped them, so a password manager and the on-screen keyboard got no hints.

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the input is at least `--el-touch-target` high (42 px with the default theme before), and the clear cross of an invalid field at least that wide and high (9 × 18 px before). The mark beside the input takes that width while the field is valid too, so the input keeps its width when the validity changes. Unchanged on a fine pointer and without the token.

## [0.1.0] - 2026-06-03

### Changed

- Hardcoded values in the stylesheet now reference design tokens with the previous values as fallbacks: `--el-space-1` / `--el-space-2` for gaps, `--el-color-success` / `--el-color-danger` for validity icon colors, `--el-font-size-sm` for the help/error message text.

### Fixed

- The `pattern` attribute is now omitted entirely when `pattern` is unset, via element-js's `optionalAttribute` directive. It previously fell back to a `[sS]*` regex — meant as "match anything" but actually matching only runs of `s` / `S` — which made the field report any ordinary value as invalid. The directive that allows omitting the attribute didn't exist when the fallback was introduced.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

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

- Initial `el-button` — a themeable button modelled on Shoelace's `<sl-button>`. Renders a native `<button>`, or an `<a>` when `href` is set. Supports `variant` (`default / primary / success / neutral / warning / danger / text`), `size` (`small / medium / large`), `outline`, `pill`, `circle`, `caret`, `loading` and `disabled`; `prefix` / `suffix` icon slots; `base / prefix / label / suffix / caret / spinner` CSS parts; and `focus()` / `blur()` / `click()` methods. `type="submit"` / `type="reset"` drive the nearest ancestor `<form>` across the shadow boundary. Styling reads the `--el-*` design tokens, so it re-skins with every theme.

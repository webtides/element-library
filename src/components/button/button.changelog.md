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

- A pressed style: a button that is pressed (`:active`) is darker than a hovered one; the `text` and `outline` variants get a tint of their text color instead. Before, pressing a button on a touch screen showed nothing.

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the button is at least `--el-touch-target` wide and high, in every size and shape. With the default theme a small button was 32 px high, a medium one 42 px and a small `circle` 32 × 32 px. A circle stays round. Unchanged on a fine pointer and without the token.

### Fixed

- A server-rendered `el-button` no longer writes unset attributes as the string `undefined` onto its control. A link button (`href` set) carried `target='undefined'`, `rel='undefined'` and `download='undefined'` in the Declarative Shadow DOM, and a `download` attribute makes the browser save the link target instead of navigating to it. A native button carried `name='undefined'` and `value='undefined'`. The fix is in `@webtides/element-js` 1.3.1 ([element-js#192](https://github.com/webtides/element-js/issues/192)), which the library now requires.
- No hover style stays on the button after a tap. A touch screen leaves `:hover` on the element that was tapped last, so the button looked hovered until the next tap elsewhere. The hover styles now only apply where the pointer can hover (`@media (hover: hover)`).
- The label of an outline `warning` button is readable on a light background. Its colour is `--el-color-warning` mixed half and half with `--el-color-fg` now, which makes it darker in a light scheme and lighter in a dark one; the border keeps the token. Before, the label had the colour of the token, which has to be light for the dark text of the filled button: `#d97706` was 3.18 : 1 on white as a label and is 7.86 : 1 now. ([#94](https://github.com/webtides/element-library/issues/94))

## [0.1.0] - 2026-06-03

### Added

- Initial `el-button` — a themeable button modelled on Shoelace's `<sl-button>`. Renders a native `<button>`, or an `<a>` when `href` is set. Supports `variant` (`default / primary / success / neutral / warning / danger / text`), `size` (`small / medium / large`), `outline`, `pill`, `circle`, `caret`, `loading` and `disabled`; `prefix` / `suffix` icon slots; `base / prefix / label / suffix / caret / spinner` CSS parts; and `focus()` / `blur()` / `click()` methods. `type="submit"` / `type="reset"` drive the nearest ancestor `<form>` across the shadow boundary. Styling reads the `--el-*` design tokens, so it re-skins with every theme.

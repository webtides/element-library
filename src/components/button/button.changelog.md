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

- `appearance` (`filled` by default, `outlined` or `plain`): how the colours of the variant are painted. It works with every variant, so a `plain` button, text only, exists in every colour; before, only the `text` variant in the brand colour did. ([#69](https://github.com/webtides/element-library/issues/69))
- `variant`, `appearance` and `size` are reflected to attributes of the same name, the defaults included, so a stylesheet can select them (`el-button[variant='brand']`). ([#69](https://github.com/webtides/element-library/issues/69))
- A pressed style: a button that is pressed (`:active`) is darker than a hovered one; an `outlined` or `plain` button gets a tint of its text color instead. Before, pressing a button on a touch screen showed nothing.
- In an `el-button-group` a button is joined with its neighbours: the corners that face a neighbour are square, and a filled button with a neighbour in front of it draws the line between the two as its border at the start. Outside of a group the button looks as before. ([#124](https://github.com/webtides/element-library/issues/124))

### Changed

- BREAKING: the button speaks the library's shared vocabulary. `variant` is `neutral` (the default), `brand`, `success`, `warning` or `danger`, and the new `appearance` replaces the `outline` flag and the `text` variant. The old values are not mapped, a button that still uses them is painted neutral and filled. Rename `variant="primary"` to `variant="brand"`, `variant="default"` to `variant="neutral"` (or leave it out), `variant="text"` to `variant="brand" appearance="plain"` and `outline="true"` to `appearance="outlined"`. Buttons that are renamed this way look as before, in every theme. ([#69](https://github.com/webtides/element-library/issues/69))
- BREAKING: the dark `neutral` button, filled in the text colour, is gone. `neutral` now is what `default` was: the muted fill with the border of the theme. There is no successor for the dark fill. ([#69](https://github.com/webtides/element-library/issues/69))
- The control inside the shadow root no longer has classes for the variant, the size and the outline (`button--primary`, `button--small`, `button--outline`). Select the host by its attributes instead. ([#69](https://github.com/webtides/element-library/issues/69))
- On a touch screen (`@media (any-pointer: coarse)`) the button is at least `--el-touch-target` wide and high, in every size and shape. With the default theme a small button was 32 px high, a medium one 42 px and a small `circle` 32 × 32 px. A circle stays round. Unchanged on a fine pointer and without the token.

### Fixed

- An ARIA attribute on `el-button` reaches the control inside it, the `<button>` or `<a>` that has the focus and that a screen reader announces. Before, it stayed on the element, which has no role: an icon button with `aria-label="Add"` was announced by its content ("+"), and `aria-expanded` or `aria-pressed` said nothing. `aria-label`, `aria-description`, `aria-expanded`, `aria-haspopup`, `aria-pressed` and `aria-current` are passed on as they are, with every change. `aria-labelledby`, `aria-describedby` and `aria-controls` name elements by id, which does not reach out of the shadow root; the control gets references to those elements instead (Chrome 135, Firefox 136, Safari 16.4; without them the relation is missing, as before). The attributes stay on the element as well. ([#108](https://github.com/webtides/element-library/issues/108))
- The `hidden` attribute hides the button. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))
- A server-rendered `el-button` no longer writes unset attributes as the string `undefined` onto its control. A link button (`href` set) carried `target='undefined'`, `rel='undefined'` and `download='undefined'` in the Declarative Shadow DOM, and a `download` attribute makes the browser save the link target instead of navigating to it. A native button carried `name='undefined'` and `value='undefined'`. The fix is in `@webtides/element-js` 1.3.1 ([element-js#192](https://github.com/webtides/element-js/issues/192)), which the library now requires.
- No hover style stays on the button after a tap. A touch screen leaves `:hover` on the element that was tapped last, so the button looked hovered until the next tap elsewhere. The hover styles now only apply where the pointer can hover (`@media (hover: hover)`).
- The label of an outlined `warning` button is readable on a light background. Its colour is `--el-color-warning` mixed half and half with `--el-color-fg` now, which makes it darker in a light scheme and lighter in a dark one; the border keeps the token. Before, the label had the colour of the token, which has to be light for the dark text of the filled button: `#d97706` was 3.18 : 1 on white as a label and is 7.86 : 1 now. ([#94](https://github.com/webtides/element-library/issues/94))

## [0.1.0] - 2026-06-03

### Added

- Initial `el-button` — a themeable button. Renders a native `<button>`, or an `<a>` when `href` is set. Supports `variant` (`default / primary / success / neutral / warning / danger / text`), `size` (`small / medium / large`), `outline`, `pill`, `circle`, `caret`, `loading` and `disabled`; `prefix` / `suffix` icon slots; `base / prefix / label / suffix / caret / spinner` CSS parts; and `focus()` / `blur()` / `click()` methods. `type="submit"` / `type="reset"` drive the nearest ancestor `<form>` across the shadow boundary. Styling reads the `--el-*` design tokens, so it re-skins with every theme.

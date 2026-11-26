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

- Initial `el-segmented-field`: one choice of a few options as a row of joined buttons, which behaves like a group of radios. It extends `el-radio-field`: a native `<fieldset>`/`<legend>` with an `<input type="radio">` per option, so the one tab stop, the arrow keys, the value in the form, its reset and `required` are native, and the label, the help message and the error message are the ones of every field. `input-change` reports the value. ([#166](https://github.com/webtides/element-library/issues/166))
- `options` as `el-radio-field` has them: plain strings, or objects with a `value`, a `label` and `disabled`. The whole field can be disabled as well.
- An option with `icon`, the address of an SVG symbol (`#grid`, `/icons.svg#grid`), shows that icon in the place of its label. The label is then its name for assistive technology and its tooltip.
- The row looks like an `el-button-group`: two neighbours share one line, only the corners at the two ends are round (at the other ends in a text that runs from right to left), and the option with the keyboard focus lies over its neighbours. The row is never wider than its place: the options share the width then, and a label breaks into lines.
- The chosen option has a tint of its text colour and a ring inside of its edge, as a pressed `el-button`. The ring is a border, so it stays where the user forces colours.
- `size` (`small`, `medium`, `large`): an option is as high as an `el-button` of that size. On a touch screen it is at least `--el-touch-target` high and wide.
- The look is the stylesheet reading the native radios. A server-rendered field does not change when the element takes over, and it submits its value before the script has run.
- `label-screen-reader-only` hides the label from the eye and keeps it as the name of the group. The field hides it with its own stylesheet, so it works on a page without an `sr-only` class.

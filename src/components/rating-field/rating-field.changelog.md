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

- Initial `el-rating-field`: a rating as a number from 1 to `max`, drawn as a row of stars. A native `<fieldset>`/`<legend>` wrapping one `<input type="radio">` per step, with the label, the help message, the error message and the layout of every field; grouping, arrow keys and form submission are native. ([#138](https://github.com/webtides/element-library/issues/138))
- `max` is the number of stars (`5` by default). `value` is the chosen step as text, `null` while nothing is chosen; a value that is no step of the scale chooses nothing. `input-change` reports the value.
- The stars up to the chosen one are filled, the others are an outline: the two differ in their shape, not in their colour alone. With a mouse, the stars up to the one under the pointer are shown as on before the click.
- `--el-rating-color` is the colour of a filled star (the accent colour of the theme without it), `--el-rating-size` the size of a star (`--el-space-5` without it).
- `required` keeps the form from being submitted without a rating, and `form.reset()` brings back the rendered one.
- Every radio is named by its number, which needs no translation. The group is touched once the user has left it, not while the focus moves from one star to the next. On a touch screen every star is at least `--el-touch-target` wide and high.

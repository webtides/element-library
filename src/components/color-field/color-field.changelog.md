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

- Initial `el-color-field`: a colour, picked in the picker of the browser. A native `<input type="color">` with the label, the help message, the error message and the layout of every field; it is submitted with its form by the control. ([#144](https://github.com/webtides/element-library/issues/144))
- `value` is the colour as the control has it, `#rrggbb`. A field without a `value` takes over the value of the control, black, and so does a field whose value the control brings into its format (`#F00` becomes `#ff0000`). `value` says what the form submits.
- `value` follows the picker while the user goes through it; `input-change` reports every value once. A value set from a script reaches the control, also after the user has picked a colour.
- `show-value` shows the value as text beside the control. It is hidden from a screen reader, which reads the value from the control.
- `options` is a list of colours the picker of the browser offers, rendered as the native list of the control. Without options the control has no list.
- The control keeps the look of the browser. With `styles/native.css` it is a well with the border, the radius and the focus ring of the other controls, as high as an input in each of the three sizes. On a touch screen it is at least `--el-touch-target` high.

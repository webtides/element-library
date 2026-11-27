# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.5.0] - 2026-11-27

### Added

- An option can show something in front of its label: `color` is a colour that is drawn as a dot, `icon` the address of an SVG symbol, as an option of `el-segmented-field` has it. Things a user knows by their colour, tags or calendars, are found by it where they are chosen. Both are decorations, hidden from assistive technology: the label stays the name of the option. They are part of the option, so they work for options as an attribute and as a property, and are in server-rendered markup. The dot keeps its colour where the user forces colours. ([#198](https://github.com/webtides/element-library/issues/198))

## [0.3.0] - 2026-11-17

### Added

- Initial `el-checkbox-group-field`: a choice of any number of options, the group of checkboxes that `el-radio-field` is for radios. A native `<fieldset>`/`<legend>` wrapping one `<input type="checkbox">` per option, all under one name, with the label, the help message, the error message and the layout of every field. ([#137](https://github.com/webtides/element-library/issues/137))
- `options` accepts plain strings or `{ value, label?, disabled? }` objects, as in `el-radio-field` and `el-select-field`.
- `value` is the list of the checked values, in the order of the options: an array from a script, JSON as an attribute. A new list checks and unchecks the options, also after the user has changed them. `input-change` reports the list.
- In a form every checked option is submitted under the `name` (`formData.getAll(name)`), and `form.reset()` brings back the rendered choice.
- `required` means at least one checked option. The field is not valid without one, and the browser refuses to submit the form: the first checkbox that is not disabled carries the validity of the group, with the `errorMessage` of the field as the text of the bubble.
- The group is touched once the user has left it, not while the focus moves from one of its checkboxes to the next.
- The box has the look of the box of `el-checkbox-field`, from the same tokens, and it is hidden from assistive technology: a checkbox is named by its label alone. On a touch screen the label of every option is at least `--el-touch-target` wide and high.

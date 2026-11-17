# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

## [0.3.0] - 2026-11-17

### Added

- Initial `el-file-field`: one or several files for a form. A native `<input type="file">` with the label, the help message, the error message and the layout of every field; the dialog, a drop onto the control and the form submission are the ones of the browser. ([#140](https://github.com/webtides/element-library/issues/140))
- `accept`, `multiple` and `capture` reach the control. `files` gives the chosen files, `value` is the list of their names, and `input-change` reports it on every choice, also one of files with the names of the files before.
- The files come from the user: a value from a script that names other files is put back to the names of the control. An empty value takes the choice away, and so does `form.reset()`.
- `required` keeps the form from being submitted without a file. An error the page renders the field with (`valid="false"`), a file that was too large for the server, shows from the start.
- The field is touched once the user has left the control for another place of the page. The dialog of the system takes the focus from the page as well, which does not touch the field: the error message of a required field does not show behind the dialog.
- The control keeps the look of the browser. With `styles/native.css` it has the border, the colours, the focus ring and the three sizes of the input of `el-input-field`, and its button the tokens of the theme. On a touch screen it is at least `--el-touch-target` high.

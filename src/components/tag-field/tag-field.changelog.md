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

- Initial `el-tag-field`: a list of short texts the user writes. A text input that turns what is entered into entries, each an `el-tag` with a remove button, with the label, the help message, the error message and the layout of every field. ([#142](https://github.com/webtides/element-library/issues/142))
- Enter adds the text of the input as an entry, and so does a comma, typed or pasted: a pasted `a, b, c` is three entries. An entry is trimmed; an empty one and one the list already has are not added.
- `value` is the list of the entries, JSON as an attribute and an array from a script; `input-change` reports it. In a form every entry is submitted under the `name` by a hidden input, also before the script has run for a list the server rendered, and `form.reset()` brings back the rendered list.
- Text that is still in the input when the form is submitted becomes an entry with the submit. It does not when the user leaves the field: the field would grow, and the submit button below it would move away under the pointer.
- `required` means at least one entry, and text in the input counts as one. The browser refuses to submit the form without, with the error message of the field in its bubble.
- After a removal the focus is on the entry that took the place of the removed one, or on the input after the last one. A live region says what was added and what was removed; `removeLabel`, `addedLabel` and `removedLabel` are the words for it.
- With `styles/native.css` the input has the look and the three sizes of the input of `el-input-field`. `size` is the size of the tags as well. On a touch screen the input and every remove button are at least `--el-touch-target` high.

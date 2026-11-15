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

- Initial `el-otp-field`: an `el-input-field` for a one-time code, the short code of a second factor. One native `<input>` for the whole code, so the code from an SMS, a paste, a password manager and a screen reader work on one control. ([#141](https://github.com/webtides/element-library/issues/141))
- `length` is the number of characters of the code (`6` by default). Without further attributes the control has `autocomplete="one-time-code"`, `inputmode="numeric"` and a pattern of `length` digits; each of them can be set to something else, a pattern for a code with letters for example.
- Spaces and hyphens are taken out of what is typed, pasted or filled in, and the code is cut at `length`: a pasted `123 456` is `123456`. A code that is full takes no further key, as an input with `maxlength` does. Nothing else is filtered; a code that does not fit the pattern is not valid.
- `input-complete` is fired once when the user has entered a code of full length that is valid, with the code as its detail, and again after the code was changed and completed again. It is not fired for a value a script sets.
- With `styles/native.css` the control has the look and the three sizes of the input of `el-input-field`.

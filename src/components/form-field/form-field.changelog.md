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

- The readme says how the fields take part in a native `<form>` ("In a form"): what is submitted, what `disabled` and `required` do, and what does not work yet. Every statement there is covered by a test of the field. ([#69](https://github.com/webtides/element-library/issues/69))

### Fixed

- A field has its own stylesheet when its parent class was connected before it. element-js keeps the stylesheets of an element on its class, and a field found the ones of its parent class there and never built its own. On a page with an `el-input-field` before an `el-password-field`, the password field had the styles of the input field only, and its toggle looked like a native button; every field after an `el-form-field` had the styles of that one only. Each field class now has a place of its own for its stylesheets.
- The error message is announced by screen readers. It is an alert now (`role="alert"`), so it is read the moment it appears, and the fields name it in the `aria-describedby` of their control while it is shown, so it is read again when the control gets focus. Before, a control pointed at the message with `aria-errormessage` at most, which few screen readers read and which axe reports (`aria-valid-attr-value`). The alert reaches every field that shows the message; `aria-describedby` is set by `el-input-field`, `el-password-field`, `el-select-field`, `el-radio-field`, `el-textarea-field` and `el-switch-field`. ([#94](https://github.com/webtides/element-library/issues/94))
- The cross of a field that is not valid empties the field, not only its control: `clearInput()` sets `value` to the empty text, `input-change` reports it, and `valid` is what the empty control says. Before, the control was empty while `value` kept the old text and no event was fired, so a page that read `value` or listened to `input-change` had another text than the one the form submitted, and a field whose text had been the fault stayed not valid. This reaches the fields that render the cross: `el-input-field`, `el-password-field` and `el-textarea-field`. ([#115](https://github.com/webtides/element-library/issues/115))
- When the browser refuses to submit a form, every field that is not valid shows its error message. Before, a field that the user had not touched showed nothing: it was `:state(invalid)` but not `touched`, so the message the page wrote for this case never appeared, and the user saw the bubble of the browser alone, for the first field only. The field is now `touched` and not `valid` after a refused submit, and its message is announced like the one that appears when it is left (`role="alert"`, named in `aria-describedby`). That holds for a click on a submit button, for Enter in a field and for `form.requestSubmit()`, in `el-input-field`, `el-password-field`, `el-textarea-field`, `el-select-field`, `el-checkbox-field`, `el-switch-field` and `el-radio-field`. The bubble of the browser stays, and with it the focus on the first field; the readme says how a page takes it away. `form.checkValidity()` and `form.reportValidity()` change nothing, and neither does a form with `novalidate`. ([#103](https://github.com/webtides/element-library/issues/103))
- `form.reset()` puts every field back to the state it was rendered with. Before, a reset changed nothing: a field writes its value to its control as the default of the control, and a reset goes back to that default, which was the value of now. An `el-input-field` that the user had emptied stayed empty, a checkbox the user had checked stayed checked, and `touched`, `valid` and the error message stayed as well. The fields now listen for the reset of their form and put back what they were connected with: the value of `el-input-field`, `el-password-field` and `el-textarea-field`, the `checked` of `el-checkbox-field` and `el-switch-field`, the option of `el-radio-field` and `el-select-field`, and `touched` and `valid` of all of them. `input-change` reports the value a field goes back to. A reset button and `el-button type="reset"` do the same; a reset that a listener cancels changes nothing. The field follows a task after the event and its control with the render after that, so read the form in the next frame. ([#102](https://github.com/webtides/element-library/issues/102))
- The `value` attribute of a field is taken as text. element-js parses every attribute, so a value that reads as a number or as JSON arrived as something else: `value="1.50"` was shown and submitted as `1.5`, `12345678901234567890` lost its last digits, `1e3` became `1000` and `[1]` became `1`, and `el-select-field` and `el-radio-field` did not find the option of such a value. That reaches `el-input-field`, `el-password-field`, `el-textarea-field`, `el-select-field`, `el-radio-field`, `el-checkbox-field` and `el-switch-field`. Their `value` property is that text now, where it was a number or a boolean before: `value="5"` gave `5` and gives `'5'`. `el-amount-field` keeps its number. Server-rendered markup still has the parsed value until the element starts in the browser: `@webtides/element-js-ssr-renderer` (0.4.0) parses the attribute itself. ([#127](https://github.com/webtides/element-library/issues/127))

## [0.1.0] - 2026-06-03

### Added

- `touched`, `valid` and `invalid` custom states on the host. Inherited by all subclasses (`InputField`, `CheckboxField`, `TextareaField`, `AmountField`, `SelectField`). The inner `.field.is-touched / .is-valid / .is-invalid` classes still exist; they remain the internal hook for event delegation and shadow-DOM rendered subclasses.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## 0.1.1 (2021-07-21)

### Changed

update element-js version

## [0.1.0] - 2020-03-15

### Added

- initial release

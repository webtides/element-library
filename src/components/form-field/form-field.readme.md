# FormField

`form-field` is a base form input component that provides common functionality for form fields including labels, validation, error messages, help text, and state management. This component is designed to be extended by specific field types (like `input-field`, `checkbox-field`, `textarea-field`, etc.).

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/form-field/define';
```

This component is typically used as a base class for other form field components rather than being used directly. However, it can be used directly if you implement the `fieldTemplate()` method:

```html
<el-form-field
    name="username"
    label="Username"
    required="true"
    error-message="Username is required"
    help-message="Choose a unique username"
>
</el-form-field>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The name attribute for the form field. |
| `value` | `string` | `null` | The current value of the form field. |
| `required` | `boolean` | `false` | Whether the field is required for form submission. |
| `disabled` | `boolean` | `false` | Whether the field is disabled. |
| `label` | `string` | `''` | The label text displayed for the field. |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to hide the label visually (but keep it accessible to screen readers). |
| `errorMessage` | `string` | `''` | Error message to display when validation fails and field is touched. Rendered as an alert (`role="alert"`), so screen readers announce it. |
| `helpMessage` | `string` | `''` | Helper text to display below the field. |
| `valid` | `boolean` | `true` | Whether the field passes validation. |
| `touched` | `boolean` | `false` | Whether the field has been interacted with (focused and blurred). |

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `onFocus()` | None | Called when the input receives focus. Updates validation state. |
| `onBlur()` | None | Called when the input loses focus. Marks field as touched and validates. |
| `onChange()` | None | Called when the input value changes. Updates value and validation state. |
| `clearInput()` | None | Focuses the input, clears its value, and resets the touched state. `value` and `valid` of the field follow, and `input-change` reports the empty value. |

#### Events

| Name           | Detail  | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| `input-change` | `value` | Fired when the field value changes. Bubbles up through the DOM. |

#### CSS States

Custom states reflected on the host (and inherited by `input-field`, `select-field`, `textarea-field`, `checkbox-field` and `amount-field`). Style with `el-input-field:state(invalid)`, etc.

| Name      | Description                                          |
| --------- | ---------------------------------------------------- |
| `valid`   | Present while the field passes validation.           |
| `invalid` | Present while the field fails validation.            |
| `touched` | Present once the field has been focused and blurred. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-fg`, `--el-color-fg-muted`, `--el-space-1`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

#### Slots

_None_ (Component uses template methods instead of slots)

## In a form

The fields that render into the page take part in a native `<form>` through their native control: `el-input-field`, `el-password-field`, `el-textarea-field`, `el-select-field`, `el-checkbox-field`, `el-switch-field` and `el-radio-field`. The control carries the `name` and belongs to the form like any other control, so no script has to collect the values.

- The value is submitted under the `name`, whether the user entered it or a script set it on the element. A checkbox or a switch submits its `value` while it is checked (`on` if it has none) and nothing while it is not; a radio group submits the selected option.
- A `disabled` field is left out.
- A `required` field that is empty keeps the form from being submitted. That is the validation of the browser.

The elements themselves are not form-associated custom elements: the control already is part of the form, and a second entry under the same name would be submitted twice.

What does not work yet:

- `form.reset()` leaves a field as it is: its value, and its `touched` and `valid` state.
- When the browser refuses a submit, a field that was not touched shows no error message of its own, only the bubble of the browser.
- `el-amount-field` renders its input in a shadow root. It is not submitted, and `required` has no effect on the form.
- `el-button type="submit"`: its `name` and `value` are not submitted, and Enter in a field does not submit the form.

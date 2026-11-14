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
| `value` | `string` | `null` | The current value of the form field. It is text: the attribute is taken as it is written, `value="1.50"` stays `1.50`. `el-amount-field` takes a number. |
| `required` | `boolean` | `false` | Whether the field is required for form submission. |
| `disabled` | `boolean` | `false` | Whether the field is disabled. |
| `label` | `string` | `''` | The label text displayed for the field. |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to hide the label visually (but keep it accessible to screen readers). |
| `errorMessage` | `string` | `''` | Error message to display when validation fails and field is touched. Rendered as an alert (`role="alert"`), so screen readers announce it. |
| `helpMessage` | `string` | `''` | Helper text to display below the field. |
| `valid` | `boolean` | `true` | Whether the field passes validation. |
| `touched` | `boolean` | `false` | Whether the field has been interacted with (focused and blurred), or the browser has refused a submit because of it. |

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

| Name      | Description                                                                                 |
| --------- | ------------------------------------------------------------------------------------------- |
| `valid`   | Present while the field passes validation.                                                  |
| `invalid` | Present while the field fails validation.                                                   |
| `touched` | Present once the field has been focused and blurred, or a submit was refused because of it. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-fg`, `--el-color-fg-muted`, `--el-space-1`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

The error message of every field has the danger colour of the theme (`--el-color-danger`). Without a theme it has the colour of the text, which can be read on any background: a red that the library picked could not be, on every page.

#### Slots

_None_ (Component uses template methods instead of slots)

## In a form

The fields that render into the page take part in a native `<form>` through their native control: `el-input-field`, `el-password-field`, `el-textarea-field`, `el-select-field`, `el-checkbox-field`, `el-switch-field` and `el-radio-field`. The control carries the `name` and belongs to the form like any other control, so no script has to collect the values.

- The value is submitted under the `name`, whether the user entered it or a script set it on the element. A checkbox or a switch submits its `value` while it is checked (`on` if it has none) and nothing while it is not; a radio group submits the selected option.
- A `disabled` field is left out.
- A `required` field that is empty keeps the form from being submitted. That is the validation of the browser.
- When the browser refuses a submit, every field that is not valid shows its `errorMessage`, as it does once the user has left it. See [A refused submit](#a-refused-submit).
- `form.reset()`, a reset button and `el-button type="reset"` put a field back to the state it was rendered with. See [Reset](#reset).

The elements themselves are not form-associated custom elements: the control already is part of the form, and a second entry under the same name would be submitted twice.

#### A refused submit

A form whose fields are not all valid is not submitted. Every field that is not valid is then `touched` and not `valid`, and shows its `errorMessage` as an alert, whether the user had been in it or not. That holds for a click on a submit button, for Enter in a field and for `form.requestSubmit()`, which is what `el-button type="submit"` calls. A form with `novalidate` is not validated, so nothing changes there.

The browser still focuses the first control that is not valid and shows its own bubble there. To show the messages of the fields alone, cancel the `invalid` event for the whole form. It does not bubble, so listen while it is captured:

```js
form.addEventListener('invalid', (event) => event.preventDefault(), true);
```

The browser then shows no bubble and moves no focus; the fields show their messages as before.

`form.checkValidity()` and `form.reportValidity()` do not make a field show its message. They are questions of a script, on every keystroke for some pages, and no attempt of the user to submit. Set `touched` on a field yourself where you want its message.

#### Reset

A reset puts a field back to the state it had when it was connected: its value, its `checked` or its selected option, and with it `touched` and `valid`, so no error message of an earlier attempt is left. `input-change` reports the value the field goes back to.

That state is not an empty one: `<el-input-field value="Ada">` shows "Ada" again, a checkbox rendered with `checked="true"` is checked again. A value that a script sets later is no new default.

- A text field or a select that is rendered with a value is `touched` from the start, and so it is after a reset. A field that is rendered with `valid="false"`, for an error the server found, shows that error again.
- The field follows a moment after the event, and its control with the next render. Read the form in the frame after the reset, not in the same task.
- A reset that a listener cancels (`event.preventDefault()`) changes nothing.
- A field that was taken out of the form is left alone.

What does not work yet:

- `el-amount-field` renders its input in a shadow root. It is not submitted, and `required` has no effect on the form.
- Server-rendered markup: `@webtides/element-js-ssr-renderer` (0.4.0) parses the `value` attribute itself. A value that reads as a number is rendered as that number, `1.50` as `1.5`, and a select does not find its option, until the element starts in the browser and puts the text back.
- `el-button type="submit"`: its `name` and `value` are not submitted, and Enter in a field does not submit the form.

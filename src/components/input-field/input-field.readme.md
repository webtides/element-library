# InputField

`input-field` is a web component that wraps the native HTML `<input>` element with additional functionality including label management, validation states, error messages, help text, and accessibility features. It extends the base `FormField` component and provides a complete form input solution with built-in validation feedback.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/src/components/input-field/input-field.js';
```

```html
<el-input-field
    name="email"
    type="email"
    label="Email Address"
    placeholder="Enter your email"
    help-message="We'll never share your email"
    error-message="Please enter a valid email address"
    required
></el-input-field>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The name attribute for the input field, used for form submission and identification |
| `value` | `string` | `null` | The current value of the input field |
| `type` | `string` | `'text'` | The type of input field (e.g., 'text', 'email', 'password', 'tel', 'url', etc.) |
| `placeholder` | `string` | `''` | Placeholder text displayed when the input is empty |
| `pattern` | `string\|boolean` | `false` | Regular expression pattern for input validation. If false, allows any input |
| `required` | `boolean` | `false` | Whether the field is required for form submission |
| `disabled` | `boolean` | `false` | Whether the field is disabled and cannot be interacted with |
| `label` | `string` | `''` | Label text displayed above the input field |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to visually hide the label while keeping it accessible to screen readers |
| `helpMessage` | `string` | `''` | Help text displayed below the label to provide additional context |
| `errorMessage` | `string` | `''` | Error message displayed when validation fails and field is touched |
| `valid` | `boolean` | `true` | Whether the current input value is valid according to the field's constraints |
| `touched` | `boolean` | `false` | Whether the user has interacted with the field (focused and blurred) |

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `clearInput()` | None | Clears the input value, focuses the field, and resets the touched state |
| `onFocus()` | None | Internal method called when input receives focus, updates validation state |
| `onBlur()` | None | Internal method called when input loses focus, marks field as touched and updates validation |
| `onChange()` | None | Internal method called when input value changes, updates value and validation state |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `value` (string) | Dispatched when the input value changes. Bubbles up through the DOM |

#### CSS Custom Properties

The component inherits styling from the base `FormField` component:

| Name | Default | Description |
| --- | --- | --- |
| Custom styling | See component styles | The field displays with a flex layout and includes validity indicators (checkmark/cross) |

#### Slots

_None_ - The component generates its own input element internally

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`, `aria-invalid`, `aria-errormessage`)
- Links labels to inputs via `for` attribute
- Supports screen reader only labels
- Visual validity indicators (✓ for valid, × for invalid)
- Error messages are properly associated with the input field

## Validation

The component provides real-time validation feedback:
- Validation state updates on focus, blur, and change events
- Visual indicators appear after the field is touched
- Error messages only display when field is touched and invalid
- Supports HTML5 validation attributes (required, pattern, type)
- Clicking the invalid indicator (×) clears the input

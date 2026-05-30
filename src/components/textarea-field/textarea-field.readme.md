# TextareaField

`textarea-field` is a web component that wraps the native HTML `<textarea>` element with enhanced functionality including label management, validation states, error messages, help text, and accessibility features. It extends the base `FormField` component and provides a complete multi-line text input solution with built-in validation feedback.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/textarea-field/define';
```

```html
<el-textarea-field
    name="message"
    label="Message"
    placeholder="Enter your message"
    rows="5"
    help-message="Please provide as much detail as possible"
    error-message="Message is required"
    required
></el-textarea-field>

<!-- With pre-filled value -->
<el-textarea-field name="bio" label="Biography" value="Tell us about yourself..." rows="8"></el-textarea-field>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The name attribute for the textarea field, used for form submission and identification |
| `value` | `string` | `null` | The current text content of the textarea field |
| `placeholder` | `string` | `''` | Placeholder text displayed when the textarea is empty |
| `rows` | `number` | `3` | The number of visible text rows in the textarea |
| `required` | `boolean` | `false` | Whether the field is required for form submission |
| `disabled` | `boolean` | `false` | Whether the field is disabled and cannot be interacted with |
| `label` | `string` | `''` | Label text displayed above the textarea field |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to visually hide the label while keeping it accessible to screen readers |
| `helpMessage` | `string` | `''` | Help text displayed below the label to provide additional context |
| `errorMessage` | `string` | `''` | Error message displayed when validation fails and field is touched |
| `valid` | `boolean` | `true` | Whether the current textarea content is valid according to the field's constraints |
| `touched` | `boolean` | `false` | Whether the user has interacted with the field (focused and blurred) |

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `clearInput()` | None | Clears the textarea content, focuses the field, and resets the touched state |
| `onFocus()` | None | Internal method called when textarea receives focus, updates validation state |
| `onBlur()` | None | Internal method called when textarea loses focus, marks field as touched and updates validation |
| `onChange()` | None | Internal method called when textarea content changes, updates value and validation state |

#### Events

| Name           | Detail           | Description                                                              |
| -------------- | ---------------- | ------------------------------------------------------------------------ |
| `input-change` | `value` (string) | Dispatched when the textarea content changes. Bubbles up through the DOM |

#### CSS Custom Properties

This component is headless by default and inherits its styling — and the `--el-*` design tokens it reads — from `FormField`. Skin it by setting those tokens via a theme — see the Storybook _Docs / Theming_ page.

#### Slots

_None_ - The component generates its own textarea element internally

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`)
- Links labels to textareas via `for` attribute
- Supports screen reader only labels
- Visual validity indicators (✓ for valid, × for invalid) appear after field is touched
- Error messages are properly associated with the textarea field
- Help messages are linked via `aria-describedby`

## Validation

The component provides real-time validation feedback:

- Validation state updates on focus, blur, and change events
- Visual indicators (checkmark for valid, cross for invalid) appear after the field is touched
- Error messages only display when field is touched and invalid
- Supports HTML5 validation attributes (required, disabled)
- Clicking the invalid indicator (×) clears the textarea content
- Tab key (keyCode 9) doesn't trigger change events to avoid false validation during navigation

## Features

- **Multi-line input**: Supports multiple rows of text input
- **Auto-resize**: The `rows` attribute controls the initial height
- **Touch-aware**: Supports both click and touch events for clearing input
- **Validation feedback**: Visual indicators show valid/invalid states after user interaction
- **Accessible**: Full ARIA support and proper semantic HTML structure

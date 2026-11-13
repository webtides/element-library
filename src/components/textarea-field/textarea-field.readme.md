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
| `autocomplete` | `string` | `null` | Passed on to the control as `autocomplete` (e.g. `email`, `current-password`, `one-time-code`) |
| `inputmode` | `string` | `null` | Passed on as `inputmode`: the on-screen keyboard to show (e.g. `numeric`, `email`) |
| `enterkeyhint` | `string` | `null` | Passed on as `enterkeyhint`: the label of the enter key on an on-screen keyboard (e.g. `next`, `send`) |
| `autocapitalize` | `string` | `null` | Passed on as `autocapitalize` (e.g. `none`, `sentences`) |
| `autocorrect` | `string` | `null` | Passed on as `autocorrect` (`on` or `off`) |
| `spellcheck` | `boolean` | `null` | Passed on as `spellcheck` (`true` or `false`) |
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
| `clearInput()` | None | Clears the textarea content, focuses the field, and resets the touched state. `value` and `valid` follow, and `input-change` reports the empty value |
| `onFocus()` | None | Internal method called when textarea receives focus, updates validation state |
| `onBlur()` | None | Internal method called when textarea loses focus, marks field as touched and updates validation |
| `onChange()` | None | Internal method called when textarea content changes, updates value and validation state |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `value` (string) | Dispatched when the text changes, however it got in: typed, pasted, dictated. Once more when the field is left after a change. Bubbles up through the DOM |

#### CSS Custom Properties

This component is headless by default and inherits its styling — and the `--el-*` design tokens it reads — from `FormField`. Skin it by setting those tokens via a theme — see the Storybook _Docs / Theming_ page.

The control itself (border, radius, padding, focus ring) is decorated by `styles/native.css`, which you import beside the theme; without it the control keeps the look of the browser.

The mark of a touched field (✓ or ✗) stands beside the textarea, at its top, in `--el-color-success` and `--el-color-danger`. The field is as high with the mark as without it, so nothing below it moves when the field is left. One limit: a textarea of one row with the look of the browser is 21 px high, lower than a line of text in a page with a large line height (24 px for 16 px text at 1.5). There the field grows by the difference. A textarea that is as wide as the field, as `styles/native.css` makes it, gets narrower by the mark and the gap (`--el-space-2`).

On a touch screen (`@media (any-pointer: coarse)`) the textarea is at least `--el-touch-target` high, which matters for `rows="1"`, and the clear cross of an invalid field at least that wide and high. The mark beside the textarea takes that width while the field is valid too, so the textarea keeps its width when the validity changes. Without that token, and on a fine pointer, the sizes stay as they are.

#### Slots

_None_ - The component generates its own textarea element internally

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`)
- Links labels to textareas via `for` attribute
- Supports screen reader only labels
- Visual validity indicators (✓ for valid, × for invalid) appear after field is touched
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the textarea while it is shown: a screen reader announces it when it appears and reads it again when the textarea gets focus
- Help messages are linked via `aria-describedby`

## Keyboard and autofill hints

`autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native control, in server-rendered markup as well. One that is not set is left out on the control.

```html
<el-textarea-field
    name="note"
    label="Note"
    autocapitalize="sentences"
    enterkeyhint="enter"
    spellcheck="true"
></el-textarea-field>
```

Removing one of these attributes later leaves it empty (`autocomplete=""`) on the element and on the control, if it was there when the element started: element-js writes a removed attribute back empty. An empty value has the meaning of the default: on for `spellcheck` and `autocorrect`, the browser's own choice for the other four.

## Server rendering

The value is rendered as the content of the `<textarea>`. A server-rendered field therefore shows its value before the element has started, and a form submits it without JavaScript.

A line break at the very start of the value is missing until the element has started: the HTML parser drops a line break that directly follows `<textarea>`.

## Validation

The component provides real-time validation feedback:

- Validation state updates on focus, on blur and with every change of the text
- Visual indicators (checkmark for valid, cross for invalid) appear beside the textarea after the field is touched
- Error messages only display when field is touched and invalid
- Supports HTML5 validation attributes (required, disabled)
- Clicking the invalid indicator (×) clears the textarea content
- Tab key (keyCode 9) doesn't trigger change events to avoid false validation during navigation (inherited from `form-field`)

## Features

- **Multi-line input**: Supports multiple rows of text input
- **Configurable height**: The `rows` attribute sets the number of visible rows
- **Touch-aware**: Supports both click and touch events for clearing input
- **Validation feedback**: Visual indicators show valid/invalid states after user interaction
- **Accessible**: Full ARIA support and proper semantic HTML structure

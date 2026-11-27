# InputField

`input-field` is a web component that wraps the native HTML `<input>` element with additional functionality including label management, validation states, error messages, help text, and accessibility features. It extends the base `FormField` component and provides a complete form input solution with built-in validation feedback.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/input-field/define';
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
| `value` | `string` | `null` | The current value of the input field. A field without one keeps `null` while its control is empty |
| `type` | `string` | `'text'` | The type of input field (e.g., 'text', 'email', 'password', 'tel', 'url', etc.). For a date or a time use `el-date-field`, which has `min`, `max` and `step`. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`: the height, the padding and the font size of the control. Reflected. Shows once `styles/native.css` decorates the control. |
| `placeholder` | `string` | `''` | Placeholder text displayed when the input is empty |
| `pattern` | `string\|boolean` | `false` | Regular expression pattern for input validation. If false, allows any input |
| `clearable` | `boolean` | `false` | Whether the control has a button that empties it. The button shows while the field has a value and is not disabled |
| `clearLabel` | `string` | `'Clear'` | The name of that button for assistive technology |
| `maxlength` | `number` | `null` | Passed on to the control as `maxlength`: the browser takes no more characters than this while the user types |
| `minlength` | `number` | `null` | Passed on as `minlength`: a text the user has typed that is shorter makes the field invalid |
| `autocomplete` | `string` | `null` | Passed on to the control as `autocomplete` (e.g. `email`, `current-password`, `one-time-code`) |
| `inputmode` | `string` | `null` | Passed on as `inputmode`: the on-screen keyboard to show (e.g. `numeric`, `email`) |
| `enterkeyhint` | `string` | `null` | Passed on as `enterkeyhint`: the label of the enter key on an on-screen keyboard (e.g. `next`, `send`) |
| `autocapitalize` | `string` | `null` | Passed on as `autocapitalize` (e.g. `none`, `sentences`) |
| `autocorrect` | `string` | `null` | Passed on as `autocorrect` (`on` or `off`) |
| `spellcheck` | `boolean` | `null` | Passed on as `spellcheck` (`true` or `false`) |
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
| `clearInput()` | None | Clears the input value, focuses the field, and resets the touched state. `value` and `valid` follow, and `input-change` reports the empty value |
| `onFocus()` | None | Internal method called when input receives focus, updates validation state |
| `onBlur()` | None | Internal method called when input loses focus, marks field as touched and updates validation |
| `onChange()` | None | Internal method called when input value changes, updates value and validation state |

#### Events

| Name           | Detail           | Description                                                         |
| -------------- | ---------------- | ------------------------------------------------------------------- |
| `input-change` | `value` (string) | Dispatched when the input value changes. Bubbles up through the DOM |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-success`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-2`), on top of the layout it shares with every field. Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

The control itself (border, radius, padding, focus ring) is decorated by `styles/native.css`, which you import beside the theme; without it the control keeps the look of the browser. The `size` changes that decorated control: a small one is 0.8 times `--el-control-height` high, a large one 1.25 times.

On a touch screen (`@media (any-pointer: coarse)`) the input is at least `--el-touch-target` high, and the clear cross of an invalid field at least that wide and high. The mark beside the input takes that width while the field is valid too, so the input keeps its width when the validity changes. Without that token, and on a fine pointer, the sizes stay as they are.

#### Slots

The field has no shadow root, so these are no slots of the platform: an element of the page with the `slot` attribute, among the children of the field, is taken into the control when the field renders. See [Content in the control](#content-in-the-control).

| Name    | Description                                                                           |
| ------- | ------------------------------------------------------------------------------------- |
| `start` | Content at the start of the control, in front of the text: an icon, a text, a button. |
| `end`   | Content at the end of the control, after the text: a unit, a button.                  |

## Content in the control

A search field with a magnifying glass, a price with its currency, an address that starts with `https://`, a key with a button that copies it: the page puts an element with `slot="start"` or `slot="end"` into the field, and the field takes it into its control.

```html
<el-input-field name="q" label="Search" clearable="true">
    <svg slot="start" aria-hidden="true">…</svg>
</el-input-field>

<el-input-field name="price" label="Price" inputmode="decimal">
    <span slot="end">Euro</span>
</el-input-field>

<el-input-field name="site" label="Your site">
    <span slot="start">https://</span>
</el-input-field>

<el-input-field name="key" label="Key" value="4f2a-91c7">
    <el-copy-button slot="end" value="4f2a-91c7"></el-copy-button>
</el-input-field>
```

- **In the control.** The content stands in a row with the input, the start in front of it and the end after it, and the text of the input does not run under it: the input is as wide as what is left. In a right-to-left page the start is at the right.
- **The elements of the page themselves.** The field moves them, it does not copy them: a listener of the page stays on its button, and the element is the same after every render. An element that comes later is taken in with the next render (`field.requestUpdate()`). A text needs an element around it (`<span slot="end">kg</span>`).
- **A click on a text or on an icon** puts the focus into the input: to the eye all of it is the control. **A button or a link** there keeps its click and is a stop of the Tab key of its own, after the input for one at the end.
- **A text is read with the input.** A unit or a currency is part of what the value means, so the input names the content as a part of its description (`aria-describedby`), in front of the help message: "Price, edit text, Euro". Write a text a screen reader can say, "Euro" before "€". **An icon is not**: give it `aria-hidden="true"`. Content with a control in it is no description either: the button has a name of its own.
- **The mark of a field that was touched** (✓ or ✗) keeps its place beside the control, and does not lie on the content at the end.
- **Server-rendered**, the content is in its place in the markup, and the element takes it over where it is.

#### With and without `styles/native.css`

The border of a native input cannot have anything inside of it. So the field renders a row around the input (`.control`), only while there is content for it or the field is `clearable`, and [`styles/native.css`](../../styles/native.css) makes that row the control: it has the border, the surface and the radius of an input, and the input inside of it has none. The focus ring is around all of it while the input has the focus, and not for a button in it, which has its own. The border of a field that is not valid is around all of it, and a disabled field fades as a whole. The row is as high as an input of its `size` alone.

Without that file the input keeps the border of the browser, as every control does, and the content stands beside it in the row.

#### The button that clears the field

`clearable="true"` adds a button at the end of the control, in front of the content at the end. It shows while the field has a value and is not disabled.

```html
<el-input-field name="city" label="City" clearable="true" clear-label="Clear the city"></el-input-field>
```

- It empties the value, `input-change` reports the empty value, and the focus is in the input after.
- It is a button with a name (`clear-label`, `Clear` by default: set it for other languages), and a stop of the Tab key after the input.
- On a touch screen it is at least `--el-touch-target` wide and high.

The fields that extend this one have both: [`el-combobox-field`](../combobox-field/combobox-field.readme.md), [`el-date-field`](../date-field/date-field.readme.md), [`el-otp-field`](../otp-field/otp-field.readme.md) and [`el-password-field`](../password-field/password-field.readme.md), which keeps its own button beside the control.

#### Not in this element

Two controls joined into one row: a select for the country code in front of a phone number, a button outside of the field that touches it. A select or a textarea with content in it.

## Keyboard and autofill hints

`autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native control, in server-rendered markup as well. One that is not set is left out on the control.

```html
<el-input-field
    name="code"
    label="Code"
    autocomplete="one-time-code"
    inputmode="numeric"
    enterkeyhint="done"
></el-input-field>
```

Removing one of these attributes later leaves it empty (`autocomplete=""`) on the element and on the control, if it was there when the element started: element-js writes a removed attribute back empty. An empty value has the meaning of the default: on for `spellcheck` and `autocorrect`, the browser's own choice for the other four.

## The length of the text

`maxlength` and `minlength` are passed on to the control, in server-rendered markup as well, and one that is not set is not rendered. The browser does the rest:

```html
<el-input-field
    name="name"
    label="Name"
    maxlength="100"
    minlength="2"
    error-message="At least 2 characters"
></el-input-field>
```

- **`maxlength`**: the control takes no more characters while the user types or pastes. Nothing is invalid for it: the text is never longer.
- **`minlength`**: a text the user has typed that is shorter makes the field invalid, the way `required` and `pattern` do: `valid` is `false`, the field shows its `error-message` once it was touched, and the form is not submitted.
- **Only what the user has typed is measured.** A browser does not hold a value against these limits that the page or the server has put into the control. A value from the server that is too long or too short is valid until the user changes it: the server checks what it gets.
- **An empty field is not too short.** `minlength` is for a text that is there. Add `required` for a field that has to be filled.
- **Say the limit.** The field shows no counter and no limit of its own: name it in `help-message`, and in `error-message` for the least length.

The fields that extend this one take both as well (`el-password-field`, `el-combobox-field`). An `el-otp-field` has `length` for its code, and a date has no length.

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`, `aria-invalid`, `aria-errormessage`)
- A text at the start or at the end of the control is part of the description of the input, an icon is not, and a button there is a control of its own
- The button that clears the field has a name (`clear-label`)
- Links labels to inputs via `for` attribute
- Supports screen reader only labels
- Visual validity indicators (✓ for valid, × for invalid)
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the input while it is shown: a screen reader announces it when it appears and reads it again when the input gets focus

## Validation

The component provides real-time validation feedback:

- Validation state updates on focus, blur, and change events
- Visual indicators appear after the field is touched
- Error messages only display when field is touched and invalid
- Supports HTML5 validation attributes (required, pattern, minlength, type)
- Clicking the invalid indicator (×) clears the input

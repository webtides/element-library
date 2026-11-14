# SelectField

`select-field` is a web component that wraps the native HTML `<select>` element with enhanced functionality including label management, validation states, error messages, help text, and accessibility features. It extends the base `FormField` component and provides a complete dropdown selection solution with built-in validation feedback and a custom dropdown indicator.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/select-field/define';
```

```html
<!-- Simple string array options -->
<el-select-field
    name="country"
    label="Country"
    placeholder="Select a country"
    options='["USA", "Canada", "Mexico"]'
    help-message="Choose your country of residence"
    error-message="Please select a country"
    required
></el-select-field>

<!-- Object-based options with values and labels, and the value that is selected -->
<el-select-field
    name="size"
    label="Size"
    placeholder="Select a size"
    value="md"
    options='[
        {"value": "sm", "label": "Small"},
        {"value": "md", "label": "Medium"},
        {"value": "lg", "label": "Large"}
    ]'
></el-select-field>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The name attribute for the select field, used for form submission and identification |
| `value` | `string` | `null` | The value of the selected option. Setting it selects the option with that value, see [Value](#value) |
| `placeholder` | `string` | `''` | Placeholder text displayed as the first disabled option when no selection is made |
| `options` | `Array<string\|object>` | `[]` | Array of options. Can be simple strings or objects with `value`, `label`, and `selected` properties |
| `required` | `boolean` | `false` | Whether the field is required for form submission |
| `disabled` | `boolean` | `false` | Whether the field is disabled and cannot be interacted with |
| `label` | `string` | `''` | Label text displayed above the select field |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to visually hide the label while keeping it accessible to screen readers |
| `helpMessage` | `string` | `''` | Help text displayed below the label to provide additional context |
| `errorMessage` | `string` | `''` | Error message displayed when validation fails and field is touched |
| `valid` | `boolean` | `true` | Whether the current selected value is valid according to the field's constraints |
| `touched` | `boolean` | `false` | Whether the user has interacted with the field (focused and blurred) |

#### Options Format

The `options` property accepts two formats:

**Simple strings:**

```json
["Option 1", "Option 2", "Option 3"]
```

**Objects with properties:**

```json
[
    { "value": "opt1", "label": "Option 1" },
    { "value": "opt2", "label": "Option 2", "selected": true },
    { "value": "opt3", "label": "Option 3" }
]
```

When using objects:

- `value`: The value submitted with the form (defaults to the string if not provided)
- `label`: The text displayed in the dropdown (defaults to the string if not provided)
- `selected`: Whether this option is selected in a field without a `value` (optional)

#### Value

`value` says which option is selected, and the select follows it: when the field is rendered, in server-rendered markup (the option carries `selected` there, so the choice is right before the script runs), and when the value is set later.

```html
<el-select-field name="size" label="Size" value="md" options='["sm", "md", "lg"]'></el-select-field>
```

```js
field.value = 'lg'; // selects "lg"
field.value = null; // back to the default of the select
```

- **`value` wins over `selected` in `options`.** `selected` is the default of a field that has no value.
- **Without a value the field takes over what the select shows**, so that `value` always says what the form submits: the option marked as `selected`, or else the first option, as in a native select. That is no change, so no `input-change` is fired for it. While the placeholder is shown, `value` stays `null`.
- **An empty value** (`''`) selects the option with an empty value if `options` has one, an "Any" entry for example. If it has none, an empty value counts as no value.
- **A value that no option has** selects nothing: the select shows its default, and `value` stays as it is. Its option is selected as soon as it arrives with `options`.
- The values are compared as text: `value="2"` selects the option `2`.

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `onFocus()` | None | Internal method called when select receives focus, updates validation state |
| `onBlur()` | None | Internal method called when select loses focus, marks field as touched and updates validation |
| `onChange()` | None | Internal method called when selection changes, updates value and validation state |
| `dropdownIndicatorTemplate()` | None | Returns the template for the dropdown indicator icon (∨) |

#### Events

| Name           | Detail           | Description                                                            |
| -------------- | ---------------- | ---------------------------------------------------------------------- |
| `input-change` | `value` (string) | Dispatched when the selected value changes. Bubbles up through the DOM |

#### CSS Custom Properties

This component is headless by default and inherits its styling — and the `--el-*` design tokens it reads — from `FormField`, plus a custom dropdown indicator. Skin it by setting those tokens via a theme — see the Storybook _Docs / Theming_ page.

The control itself (border, radius, padding, focus ring) is decorated by `styles/native.css`, which you import beside the theme; without it the control keeps the look of the browser. The field renders a chevron of its own, hidden as long as the select has the look of the browser. `native.css` takes the native chevron away and shows that one, in `--el-select-indicator-color` (by default `--el-color-fg-muted`).

On a touch screen (`@media (any-pointer: coarse)`) the select is at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

#### Slots

_None_ - The component generates its own select element and options internally

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`, `aria-invalid`, `aria-errormessage`)
- Links labels to select elements via `for` attribute
- Supports screen reader only labels
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the select while it is shown: a screen reader announces it when it appears and reads it again when the select gets focus
- Placeholder option is disabled to prevent invalid submissions

## Validation

The component provides validation feedback:

- Validation state updates on focus, blur, and change events
- Error messages display when field is touched and invalid
- Supports HTML5 validation (required attribute)
- Inherits validation behavior from the base `FormField` component

## Customization

The dropdown indicator can be customized by extending the component and overriding the `dropdownIndicatorTemplate()` method to return custom HTML/SVG icons.

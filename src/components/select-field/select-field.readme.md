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

<!-- Object-based options with values and labels -->
<el-select-field
    name="size"
    label="Size"
    placeholder="Select a size"
    options='[
        {"value": "sm", "label": "Small"},
        {"value": "md", "label": "Medium", "selected": true},
        {"value": "lg", "label": "Large"}
    ]'
></el-select-field>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The name attribute for the select field, used for form submission and identification |
| `value` | `string` | `null` | The current selected value of the select field |
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
- `selected`: Whether this option should be pre-selected (optional)

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

The component inherits styling from the base `FormField` component and includes a dropdown indicator.

#### Slots

_None_ - The component generates its own select element and options internally

## Accessibility

- Includes proper ARIA attributes (`aria-describedby`, `aria-invalid`, `aria-errormessage`)
- Links labels to select elements via `for` attribute
- Supports screen reader only labels
- Error messages are properly associated with the select field
- Placeholder option is disabled to prevent invalid submissions

## Validation

The component provides validation feedback:

- Validation state updates on focus, blur, and change events
- Error messages display when field is touched and invalid
- Supports HTML5 validation (required attribute)
- Inherits validation behavior from the base `FormField` component

## Customization

The dropdown indicator can be customized by extending the component and overriding the `dropdownIndicatorTemplate()` method to return custom HTML/SVG icons.

# CheckboxField

`checkbox-field` is a form input component that extends the base `form-field` component to provide a styled checkbox input with label, validation, and state management. It includes a custom checkmark indicator and supports all standard form field features.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/checkbox-field/define';
```

```html
<el-checkbox-field name="terms" value="accepted" label="I agree to the terms and conditions" required="true">
</el-checkbox-field>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Controls whether the checkbox is checked or unchecked. |
| `name` | `string` | `''` | The name attribute for the checkbox input. |
| `value` | `string` | `null` | The value attribute for the checkbox input. |
| `label` | `string` | `''` | The label text displayed next to the checkbox. |
| `required` | `boolean` | `false` | Whether the checkbox is required for form submission. |
| `disabled` | `boolean` | `false` | Whether the checkbox is disabled. |
| `valid` | `boolean` | `true` | Whether the checkbox passes validation. |
| `touched` | `boolean` | `false` | Whether the checkbox has been interacted with. |
| `errorMessage` | `string` | `''` | Error message to display when validation fails. |
| `helpMessage` | `string` | `''` | Helper text to display below the checkbox. |
| `labelScreenReaderOnly` | `boolean` | `false` | Whether to hide the label visually (but keep it accessible to screen readers). |

#### Methods

_Inherits methods from FormField component_

#### Events

| Name           | Detail  | Description                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------- |
| `input-change` | `value` | Fired when the checkbox state changes. The event bubbles up through the DOM. |

#### CSS States

| Name      | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| `checked` | Present while the checkbox is checked. Style with `el-checkbox-field:state(checked)`. |

Also inherits the `valid` / `invalid` / `touched` states from [`form-field`](../form-field/form-field.readme.md).

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-accent`, `--el-color-border`, `--el-radius-sm`, `--el-focus-ring-width`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

#### Slots

_None_

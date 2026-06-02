# RadioField

`radio-field` is a single-choice radio group. It renders a native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s — so grouping, arrow-key navigation and form submission are all native — with a custom indicator on top. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is headless by default: without a theme the indicator falls back to a `currentColor` outline.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/radio-field/define';
```

```html
<el-radio-field name="plan" label="Choose a plan" required="true"></el-radio-field>

<script>
    document.querySelector('el-radio-field').options = ['Starter', 'Pro', 'Enterprise'];
</script>
```

Options may be plain strings or objects with separate `value` / `label` and an optional per-option `disabled` flag:

```js
field.options = [
    { value: 'standard', label: 'Standard (free)' },
    { value: 'priority', label: 'Priority' },
    { value: 'dedicated', label: 'Dedicated (sold out)', disabled: true }
];
```

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | The selected option's value. |
| `options` | `Array<string \| { value: string, label?: string, disabled?: boolean }>` | `[]` | Options to render. Strings are used as both value and label; objects allow a separate label/disabled. |

#### Events

| Name           | Detail               | Description                            |
| -------------- | -------------------- | -------------------------------------- |
| `input-change` | `string` (the value) | Fired when the selected value changes. |

#### CSS States

| Name      | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| `touched` | Set once the group has been focused and blurred.                          |
| `valid`   | Set while the group passes validation.                                    |
| `invalid` | Set while the group fails validation (e.g. `required` with no selection). |

#### CSS Custom Properties

Headless by default; reads the library's `--el-*` design tokens (`--el-color-accent`, `--el-color-border`, `--el-color-bg`, `--el-space-*`, `--el-border-width`, `--el-focus-ring-width`, `--el-duration-md`, `--el-ease`, `--el-color-fg-muted`, `--el-color-danger`). Skin it via a theme — see the Storybook _Docs / Theming_ page.

## Accessibility

- Uses a native `<fieldset>` + `<legend>`, so the group is announced with its label and radios are mutually exclusive with native arrow-key navigation.
- The native radio stays in the accessibility tree and focusable; it is only hidden visually, with keyboard focus reflected onto the custom indicator via `:focus-visible`.
- Validation messages surface only once the group is `touched`.

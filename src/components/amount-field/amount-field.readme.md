# AmountField

`amount-field` is a numeric amount stepper input. It renders a readonly `<input type="number">` flanked by increment (`+`) and decrement (`-`) buttons, with optional `min` and `max` bounds. It extends the base `FormField` component and inherits its label, help and validation surface.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/amount-field/define';
```

```html
<el-amount-field name="quantity" value="1" min="0" max="10" label="Quantity"></el-amount-field>
```

## API

#### Properties/Attributes

| Name    | Type              | Default    | Description                                                     |
| ------- | ----------------- | ---------- | --------------------------------------------------------------- |
| `name`  | `string`          | `'amount'` | Form name for the underlying `<input>` element.                 |
| `value` | `number`          | `1`        | Current numeric value of the field.                             |
| `min`   | `number \| false` | `0`        | Lower bound. Set to `false` to leave the value unbounded below. |
| `max`   | `number \| false` | `false`    | Upper bound. Set to `false` to leave the value unbounded above. |

Inherits the remaining form properties (`required`, `disabled`, `label`, `helpMessage`, `errorMessage`, `valid`, `touched`, …) from [`FormField`](../form-field/form-field.readme.md).

#### Methods

_Inherits methods from the `FormField` component._

#### Events

| Name           | Detail  | Description                                                                           |
| -------------- | ------- | ------------------------------------------------------------------------------------- |
| `input-change` | `value` | Inherited from `FormField`. Fired when the value changes. Bubbles up through the DOM. |

#### Slots

| Name    | Description                                             |
| ------- | ------------------------------------------------------- |
| `plus`  | Replaces the default `+` glyph in the increment button. |
| `minus` | Replaces the default `-` glyph in the decrement button. |

#### CSS Parts

| Name      | Description                                                |
| --------- | ---------------------------------------------------------- |
| `wrapper` | The outer container around the input and stepper buttons.  |
| `button`  | Applied to both stepper buttons.                           |
| `plus`    | Applied to the increment button (in addition to `button`). |
| `minus`   | Applied to the decrement button (in addition to `button`). |
| `input`   | The numeric input element.                                 |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-md`, `--el-touch-target`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

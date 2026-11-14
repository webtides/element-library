# AmountField

`amount-field` is a numeric amount stepper input. It renders a readonly `<input type="number">` flanked by increment (`+`) and decrement (`-`) buttons, with optional `min` and `max` bounds. It extends the base `FormField` component: the `label` is rendered above the stepper and names the input, the `helpMessage` between the two, and the `errorMessage` below the stepper while the field is not valid.

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

The stepper keeps the value between `min` and `max`, and the field checks nothing else. A page that finds the amount wrong sets `valid="false"`, and the field shows its `errorMessage`. The field has a value from the start and is `touched` with it, so that is all it takes.

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

| Name            | Description                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `label`         | The label above the stepper. Only rendered when `label` is set.                              |
| `help-message`  | The help message, between the label and the stepper.                                         |
| `error-message` | The error message below the stepper. Only rendered while the field is touched and not valid. |
| `wrapper`       | The outer container around the input and stepper buttons.                                    |
| `button`        | Applied to both stepper buttons.                                                             |
| `plus`          | Applied to the increment button (in addition to `button`).                                   |
| `minus`         | Applied to the decrement button (in addition to `button`).                                   |
| `input`         | The numeric input element.                                                                   |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-md`, `--el-touch-target`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

The label, the help message, the stepper and the error message stack in a column, and the texts have the look they have in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`. The field renders into a shadow root, so a page reaches these texts as parts.

The buttons are at least `--el-touch-target` high on every pointer. On a touch screen (`@media (any-pointer: coarse)`) they are at least that wide as well, and the input is as high as the buttons.

## Accessibility

- The input is named by the label.
- The input names the help message in `aria-describedby`, and the error message while that is shown: a screen reader reads both when the input gets focus.
- The input says whether the field is valid (`aria-invalid`).
- The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

# AmountField

`amount-field` is a numeric amount stepper input. It renders a readonly `<input type="number">` flanked by increment (`+`) and decrement (`-`) buttons, with optional `min` and `max` bounds. It extends the base `FormField` component: the `label` is rendered above the stepper and names the input, the `helpMessage` between the two, and the `errorMessage` below the stepper while the field is not valid.

The field renders into the page, as every field does. Its input belongs to the form around it, see [In a form](#in-a-form).

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

| Name         | Type              | Default      | Description                                                     |
| ------------ | ----------------- | ------------ | --------------------------------------------------------------- |
| `name`       | `string`          | `'amount'`   | Form name for the underlying `<input>` element.                 |
| `value`      | `number`          | `1`          | Current numeric value of the field.                             |
| `min`        | `number \| false` | `0`          | Lower bound. Set to `false` to leave the value unbounded below. |
| `max`        | `number \| false` | `false`      | Upper bound. Set to `false` to leave the value unbounded above. |
| `plusLabel`  | `string`          | `'Increase'` | The accessible name of the increment button.                    |
| `minusLabel` | `string`          | `'Decrease'` | The accessible name of the decrement button.                    |

Inherits the remaining form properties (`required`, `disabled`, `label`, `helpMessage`, `errorMessage`, `valid`, `touched`, …) from [`FormField`](../form-field/form-field.readme.md).

The stepper keeps the value between `min` and `max`, and the field checks nothing else. A page that finds the amount wrong sets `valid="false"`, and the field shows its `errorMessage`. The field has a value from the start and is `touched` with it, so that is all it takes.

#### Methods

_Inherits methods from the `FormField` component._

#### Events

| Name           | Detail  | Description                                                                           |
| -------------- | ------- | ------------------------------------------------------------------------------------- |
| `input-change` | `value` | Inherited from `FormField`. Fired when the value changes. Bubbles up through the DOM. |

#### Slots

_None._ The field renders into the page.

#### CSS Custom Properties

| Name                      | Default | Description                                     |
| ------------------------- | ------- | ----------------------------------------------- |
| `--el-amount-field-plus`  | `'+'`   | The sign of the increment button, a CSS string. |
| `--el-amount-field-minus` | `'-'`   | The sign of the decrement button, a CSS string. |

```css
el-amount-field {
    --el-amount-field-plus: '▲';
    --el-amount-field-minus: '▼';
}
```

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-md`, `--el-touch-target`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

The label, the help message, the stepper and the error message stack in a column, and the texts have the look they have in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

#### Styling

The elements of the field are in the page, where a stylesheet selects them:

| Selector                          | Element                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `el-amount-field label`           | The label above the stepper. Only rendered when `label` is set.      |
| `el-amount-field .help-message`   | The help message, between the label and the stepper.                 |
| `el-amount-field .error-message`  | The error message below the stepper, while it is shown.              |
| `el-amount-field .stepper`        | The container around the input and the two buttons, with the border. |
| `el-amount-field .step`           | Both buttons.                                                        |
| `el-amount-field .plus`, `.minus` | The increment and the decrement button.                              |
| `el-amount-field input`           | The numeric input.                                                   |

The sign of a button is its `::before`. The stepper is styled by the field itself and not by `styles/native.css`: its input has no border of its own.

The buttons are at least `--el-touch-target` high on every pointer. On a touch screen (`@media (any-pointer: coarse)`) they are at least that wide as well, and the input is as high as the buttons.

## In a form

The input of the field is a control of the form around it, like the control of every other field.

- The value is submitted under the `name`: the one the field was rendered with, one that plus and minus have changed, and one that a script sets.
- A `disabled` field is left out. A `<fieldset disabled>` around the field disables the input and both buttons.
- `form.reset()` brings back the value the field was rendered with. See [Reset](../form-field/form-field.readme.md#reset).
- The buttons are of the type `button`: they do not submit the form.
- In server-rendered markup the input is there with its name and its value, so a form that is submitted before the script has run has the rendered value. The buttons need the script.

## Migrating from the shadow root

Before, the field rendered into a shadow root, where its input belonged to no form.

| Before | Now |
| --- | --- |
| `<span slot="plus">` / `<span slot="minus">` | `--el-amount-field-plus` / `--el-amount-field-minus`, or a rule for `.plus::before` / `.minus::before` |
| `::part(label)`, `::part(help-message)`, `::part(error-message)` | `el-amount-field label`, `.help-message`, `.error-message` |
| `::part(wrapper)` | `el-amount-field .stepper` |
| `::part(button)`, `::part(plus)`, `::part(minus)` | `el-amount-field .step`, `.plus`, `.minus` |
| `::part(input)` | `el-amount-field input` |
| `el.shadowRoot.querySelector(…)` | `el.querySelector(…)` |

The buttons have a name now (`plusLabel`, `minusLabel`); it was their sign.

## Accessibility

- The input is named by the label.
- The buttons are named by `plusLabel` and `minusLabel`. Their signs are drawn by the stylesheet and are no part of the name.
- The input names the help message in `aria-describedby`, and the error message while that is shown: a screen reader reads both when the input gets focus.
- The input says whether the field is valid (`aria-invalid`).
- The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

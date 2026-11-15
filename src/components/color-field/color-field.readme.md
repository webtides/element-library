# ColorField

`color-field` takes a colour: the colour of a label, of a calendar, the accent of a workspace. It renders a native `<input type="color">`, so the picker, the keyboard and the form submission are the ones of the browser. It extends `form-field`, inheriting the label, help text, error message and touched-state handling.

It is headless by default: the control keeps the look of the browser. `styles/native.css` gives it the border, the radius and the height of the other controls.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/color-field/define';
```

```html
<el-color-field name="accent" label="Accent colour" value="#2563eb"></el-color-field>

<el-color-field
    name="label"
    label="Label colour"
    value="#16a34a"
    show-value="true"
    options='["#2563eb", "#16a34a", "#f59e0b", "#dc2626"]'
></el-color-field>
```

#### The value

The value is the colour as the control has it: `#rrggbb`, in lower case. That is what the form submits.

A colour input always has a value. Without a `value` the control is black, and the field takes that over: `value` is `#000000`. That is no change, so no `input-change` reports it.

The control also brings a value from outside into its format, and the field takes over what the control made of it: `#F00` becomes `#ff0000`. A text that is no colour becomes black. Which other notations a browser reads (`red`, `rgb(255 0 0)`) is up to the browser, so give the field `#rrggbb`.

The field cannot be empty. A page that needs "no colour" puts a checkbox or a button beside it.

#### Colours to pick from

`options` is a list of colours the picker of the browser offers, the colours of a brand for example. The field renders them as the native list of the control (`<datalist>`). How a browser shows them is up to the browser, and one that does not know the list shows its picker without them. The user can still pick any other colour.

```js
field.options = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'];
```

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | The colour, `#rrggbb`. Without one: the value of the control, see above. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the control. Reflected to the `size` attribute. It shows once the control is decorated. |
| `showValue` | `boolean` | `false` | Shows the value beside the control (`show-value`). |
| `options` | `Array<string \| { value, label? }>` | `[]` | Colours the picker offers. A `label` is passed on to the option of the list. |

`required` has no effect: the control always has a value. The browser never finds a colour invalid, so the error message shows when the page sets `valid="false"` after a check of its own.

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `string` (the value) | Fired when the value changes, also while the user goes through the picker. Each value once. |

#### CSS States

| Name      | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `touched` | Set once the control has been focused and left. A value alone does not set it.            |
| `valid`   | Set while the field passes validation.                                                    |
| `invalid` | Set while the field fails validation, which for this field is when the page says it does. |

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`). With `styles/native.css` the control is a well with the border of the other controls (`--el-border-width`, `--el-color-border`, `--el-radius-md`) on `--el-color-bg`. It is as high as an input of its size (`--el-control-height`) and half again as wide, and the colour fills it up to a rim of `--el-space-1`. Keyboard focus shows the ring of the theme (`--el-focus-ring-width`, `--el-focus-ring-offset`, `--el-color-focus-ring`).

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`. The shown value stands after the control, in its row.

On a touch screen (`@media (any-pointer: coarse)`) the control is at least `--el-touch-target` high. Without that token, and on a fine pointer, the size stays as it is.

## Accessibility

- The native control is named by the label, and it says its value itself. Enter and Space open the picker of the browser, which brings its own keyboard handling.
- The shown value is hidden from assistive technology (`aria-hidden`): the control already says it, and it would be heard twice.
- A colour alone says little to a user who cannot tell colours apart. `show-value` gives the value as text; where a colour has a meaning, name it in the page.
- The control names the help message in `aria-describedby`, and the error message while that is shown.
- The control says whether the field is valid (`aria-invalid`).
- The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

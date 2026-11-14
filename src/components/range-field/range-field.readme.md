# RangeField

`range-field` takes a number from a span, picked with a thumb on a track: a volume, a price limit, an opacity. It renders a native `<input type="range">`, so the keyboard, the touch handling and the form submission are the ones of the browser. It extends `form-field`, inheriting the label, help text, error message and touched-state handling.

It is headless by default: the control keeps the look of the browser. `styles/native.css` makes it as wide as the field and gives it the accent colour of the theme.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/range-field/define';
```

```html
<el-range-field name="volume" label="Volume" value="40"></el-range-field>

<el-range-field
    name="opacity"
    label="Opacity"
    min="0"
    max="1"
    step="0.05"
    value="0.5"
    show-value="true"
></el-range-field>
```

#### The value

A range always has a value. Without a `value` the control puts its thumb in the middle of the span, and the field takes that value over: `value` says what the form submits. That is no change, so no `input-change` reports it.

The control also keeps its value inside the span and on a step. A value from outside that does not fit, such as `80` in a span up to `50`, becomes the value the control makes of it, and the field takes that over as well.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | The value, as the text the form submits. Without one: the value of the control, see above. |
| `min` | `number` | `0` | The lower end of the span. |
| `max` | `number` | `100` | The upper end of the span. |
| `step` | `number \| 'any'` | `1` | The distance between two values. `'any'` takes every value of the span. |
| `showValue` | `boolean` | `false` | Shows the value beside the control (`show-value`). |

`required` has no effect: the control always has a value. The browser never finds a range invalid, so the error message shows when the page sets `valid="false"` after a check of its own.

#### Events

| Name           | Detail               | Description                                                                |
| -------------- | -------------------- | -------------------------------------------------------------------------- |
| `input-change` | `string` (the value) | Fired when the value changes, also while the thumb moves. Each value once. |

#### CSS States

| Name      | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `touched` | Set once the control has been focused and left. A value alone does not set it.            |
| `valid`   | Set while the field passes validation.                                                    |
| `invalid` | Set while the field fails validation, which for this field is when the page says it does. |

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`). With `styles/native.css` the control is as wide as the field, has `--el-color-accent` on its track and its thumb, and shows keyboard focus with the ring of the theme (`--el-focus-ring-width`, `--el-focus-ring-offset`, `--el-color-focus-ring`). The track and the thumb stay the ones the browser draws.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

The shown value stands after the control, in its row. It keeps the room of the longest value of the span, so the control does not change its length while the thumb moves.

On a touch screen (`@media (any-pointer: coarse)`) the control is at least `--el-touch-target` high. Without that token, and on a fine pointer, the size stays as it is.

## Accessibility

- The native control is a slider for a screen reader, named by the label, and it says its value itself. Arrow keys move the thumb by a step, Home and End to the ends of the span.
- The shown value is hidden from assistive technology (`aria-hidden`): the control already says it, and it would be heard twice.
- The control names the help message in `aria-describedby`, and the error message while that is shown.
- The control says whether the field is valid (`aria-invalid`).
- The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

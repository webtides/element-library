# DateField

`date-field` takes a date, a time or both: a birthday, the day of a delivery, the start of a booking. It extends `input-field`, inheriting the label, help text, error message, `required`, the sizes and the touched-state handling.

It renders the control of the browser for the `type` (`<input type="date">` and its relatives), so the picker fits the platform, the user sees the date in the order of their language, and the keyboard and a screen reader work as the browser has them. The field has no calendar of its own.

It adds what a date needs and a text does not: the earliest and the latest value (`min`, `max`) and the step between two values (`step`).

It is headless by default: the control keeps the look of the browser. `styles/native.css` gives it the look of the input of `el-input-field`. The picker is drawn by the browser and stays as it is.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/date-field/define';
```

```html
<el-date-field name="birthday" label="Birthday" max="2026-11-15"></el-date-field>

<el-date-field name="pickup" label="Pick-up" type="time" min="09:00" max="17:00" step="900"></el-date-field>

<el-date-field name="start" label="Start" type="datetime-local" value="2026-11-15T14:30"></el-date-field>
```

#### The value

The value is text in the one format of the control, whatever the language of the user and whatever the control shows:

| `type`           | Format             | Example            |
| ---------------- | ------------------ | ------------------ |
| `date`           | `YYYY-MM-DD`       | `2026-11-15`       |
| `time`           | `hh:mm`, 24 hours  | `14:30`            |
| `datetime-local` | `YYYY-MM-DDThh:mm` | `2026-11-15T14:30` |
| `month`          | `YYYY-MM`          | `2026-11`          |
| `week`           | `YYYY-Www`         | `2026-W46`         |

`min` and `max` are in the same format. A time has its seconds (`14:30:15`) when the `step` asks for them.

The control takes a value in its format only. For every other it is empty: `15.11.2026`, a day that does not exist (`2026-02-30`), a date in a field for a time. The field takes that over: `value` is empty then, as is what the form submits, and `input-change` reports it.

While the user is still entering a date, the control has no value yet, and neither has the field.

#### The limits

A value before `min`, after `max` or beside a `step` is not valid. The field says so like every field: with its error message once it is touched, or when the browser refuses to submit the form. The picker of a browser usually does not offer such a value; the keyboard can still enter it.

```html
<el-date-field
    name="delivery"
    label="Delivery"
    min="2026-11-16"
    max="2026-12-23"
    required="true"
    error-message="Pick a day between 16 November and 23 December."
></el-date-field>
```

The step is in days for a date, in weeks for a week, in months for a month and in seconds for a time: `step="900"` is every quarter of an hour.

A month and a week have no control of their own in every browser. Where one is missing, the browser renders a text input, and the user has to write the format above: say it in the help message, or ask for a date.

## API

#### Properties/Attributes

Inherits all of `input-field`'s properties and of `form-field` (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'date' \| 'time' \| 'datetime-local' \| 'month' \| 'week'` | `'date'` | What the field takes. |
| `value` | `string` | `null` | The value, in the format of the control. |
| `min` | `string` | `null` | The earliest value, in the format of the control. `null` is no limit. |
| `max` | `string` | `null` | The latest value, in the format of the control. `null` is no limit. |
| `step` | `number \| 'any'` | `null` | The distance between two values. `null` is the step of the browser. |

`size` works as on `el-input-field`. `placeholder` and `pattern` have no effect on these controls: the browser shows the parts of a date in their place, and a date has no pattern to match.

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `string` (the value) | Fired when the value changes: entered, picked in the picker, set by a script. |

#### CSS States

Inherited from `form-field`: `touched`, `valid`, `invalid`.

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`). With `styles/native.css` the control has the border, the radius, the padding, the colours, the focus ring and the three sizes of the input of `el-input-field`.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the control is at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

## Content in the control

As [`el-input-field`](../input-field/input-field.readme.md#content-in-the-control), which this field extends, it takes an element of the page with `slot="start"` or `slot="end"` into its control, and `clearable="true"` adds a button that empties it (`clear-label` is its name).

```html
<el-date-field name="start" label="Start" type="time"><span slot="end">UTC</span></el-date-field>
```

The control of the browser has an icon of its own at its end, which opens the picker: content at the end stands after it.

## Accessibility

- The control is the native one for a date or a time, named by the label (`<label for>`). Its parts (day, month, year) are entered with the keyboard and changed with the arrow keys, and the picker of the browser brings its own keyboard handling.
- The user sees and hears the date in the order of their language. The format of `value` is for the page, not for the user: do not put it into the label.
- It names the help message in `aria-describedby`, and the error message while that is shown, and says whether it is valid (`aria-invalid`).
- Say the limits in the help message or the error message: "between 16 November and 23 December". The browser has a text of its own for them only in its bubble, when it refuses a submit.
- Validation messages surface only once the field is `touched`. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

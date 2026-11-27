# OtpField

`otp-field` takes a one-time code: the short code of a second factor that the user gets by SMS, by mail or from an app. It extends `input-field`, inheriting the label, help text, error message, `required`, the sizes and the touched-state handling.

It is one native `<input>`, not one per digit. The code from an SMS, a paste, a password manager and a screen reader all work on one control; with a box per digit each of them has to be rebuilt by hand.

It is headless by default: the control keeps the look of the browser. `styles/native.css` gives it the look of the input of `el-input-field`.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/otp-field/define';
```

```html
<el-otp-field name="code" label="Code from the SMS" required="true"></el-otp-field>
```

Without further attributes the control has `autocomplete="one-time-code"`, so a phone offers the code of an SMS it has just got, `inputmode="numeric"`, so it shows the digits, and a pattern of `length` digits.

#### What the user enters

Spaces and hyphens are taken out of what is typed, pasted or filled in: a mail shows a code as `123 456` or `123-456`, and that is how it is pasted. The code is cut at `length`.

A code that is full takes no further key, as an input with `maxlength` does: the character would push the last one of the code out. Nothing else is held back or filtered. A code that does not fit the pattern is not valid, and the field says so with its error message.

#### When the code is complete

`input-complete` is fired once the user has entered a code of full length that is valid, with the code as its detail. A page can submit the form with it:

```js
field.addEventListener('input-complete', () => form.requestSubmit());
```

It is fired again after the code was changed and completed again. It is not fired for a value a script sets.

#### A code with letters

```html
<el-otp-field
    name="backup"
    label="Backup code"
    length="8"
    pattern="[A-Za-z0-9]{8}"
    inputmode="text"
    autocomplete="off"
></el-otp-field>
```

## API

#### Properties/Attributes

Inherits all of `input-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`, `size`, `placeholder`, `enterkeyhint`, `autocapitalize`, `autocorrect`, `spellcheck`) and changes or adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `length` | `number` | `6` | The number of characters of the code. |
| `pattern` | `string \| false` | `false` | Regular expression for the code. `false` is a pattern of `length` digits. |
| `autocomplete` | `string \| null` | `'one-time-code'` | Passed on to the control as `autocomplete`. |
| `inputmode` | `string \| null` | `'numeric'` | Passed on to the control as `inputmode`. `'text'` for a code with letters. |

`value` is the code as text, so a code that starts with a zero keeps it.

The control has no `maxlength`: the browser would cut a pasted `123 456` before the field has taken the space out. The field does what `maxlength` does itself.

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `string` (the value) | Fired when the value changes. |
| `input-complete` | `string` (the code) | Fired when the user has entered a code of full length that is valid. Once for a code, see above. |

#### CSS States

| Name      | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `touched` | Set once the user has focused and left the control, or the field has a value. |
| `valid`   | Set while the field passes validation.                                        |
| `invalid` | Set while the field fails validation (the pattern, `required`).               |

#### CSS Custom Properties

Headless by default; the field reads the tokens `el-input-field` reads. With `styles/native.css` the control has the border, the radius, the padding, the colours, the focus ring and the three sizes of the input of `el-input-field`. See the Storybook _Docs / Theming_ page.

The field is as wide as its container. A width of its own goes on the element:

```css
el-otp-field {
    max-width: 12rem;
}
```

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the control and the clear cross are at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

## Content in the control

As [`el-input-field`](../input-field/input-field.readme.md#content-in-the-control), which this field extends, it takes an element of the page with `slot="start"` or `slot="end"` into its control, and `clearable="true"` adds a button that empties it (`clear-label` is its name).

```html
<el-otp-field name="code" label="Code"><span slot="start">G-</span></el-otp-field>
```

## Accessibility

- One native text input, named by the label (`<label for>`). A screen reader reads the code as one value, and the user moves in it as in any text.
- The control names the help message in `aria-describedby`, and the error message while that is shown, and says whether it is valid (`aria-invalid`).
- Say in the label or in the help message how long the code is and where it comes from.
- A page that submits the form on `input-complete` moves the user on without a key press. Do that only where a wrong code can be entered again.

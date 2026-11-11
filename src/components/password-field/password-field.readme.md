# PasswordField

`password-field` is a masked password input with an optional show/hide reveal toggle. It extends `input-field` (and therefore `form-field`), inheriting the label, help text, error message, `required` and validation surface; it pins the input `type` to `password` and flips it to `text` while revealed.

It is headless by default, like `input-field` — the native input keeps its browser look until a theme decorates it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/password-field/define';
```

```html
<el-password-field name="password" label="Password" required="true"></el-password-field>

<!-- Hide the reveal button -->
<el-password-field name="pin" label="PIN" password-toggle="false"></el-password-field>
```

## API

#### Properties/Attributes

Inherits all of `input-field`'s properties (`name`, `value`, `placeholder`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `pattern`, `valid`, `touched`, and the keyboard and autofill hints `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect`, `spellcheck`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `password-toggle` | `boolean` | `true` | Whether to render the show/hide reveal button. |
| `password-visible` | `boolean` | `false` | Whether the value is currently revealed as plain text. |
| `show-label` | `string` | `'Show password'` | Accessible label of the reveal button while the value is masked. |
| `hide-label` | `string` | `'Hide password'` | Accessible label of the reveal button while the value is revealed. |

> `type` is fixed to `password` (and switches to `text` while revealed); setting it has no effect.

Set `autocomplete` so that a password manager can tell a login from a sign-up: `current-password` for a login, `new-password` where a password is chosen. The hints stay on the input when the toggle reveals or masks the value.

#### Methods

| Name                         | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `togglePasswordVisibility()` | Toggles between the masked and revealed states. |

#### Events

| Name           | Detail               | Description                           |
| -------------- | -------------------- | ------------------------------------- |
| `input-change` | `string` (the value) | Fired when the input's value changes. |

#### CSS Custom Properties

Headless by default; the reveal button reads `--el-color-fg-muted`, `--el-color-accent`, `--el-focus-ring-width` and `--el-radius-sm`, and the field inherits `input-field`'s tokens (`--el-color-success`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-*`). Skin it via a theme — see the Storybook _Docs / Theming_ page.

On a touch screen (`@media (any-pointer: coarse)`) the reveal button is at least `--el-touch-target` wide and high, the input at least that high, and the clear cross of an invalid field at least that wide and high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- The reveal button is a real `<button>` with an `aria-label` that flips between "Show password" and "Hide password", and an `aria-pressed` state, so its purpose and state are announced. Set `show-label` and `hide-label` to translate the two labels.
- Validation messages surface only once the field is `touched` (inherited from `form-field`).
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the input while it is shown: a screen reader announces it when it appears and reads it again when the input gets focus.

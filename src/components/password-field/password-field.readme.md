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

Inherits all of `input-field`'s properties (`name`, `value`, `placeholder`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `pattern`, `valid`, `touched`) and adds:

| Name               | Type      | Default | Description                                            |
| ------------------ | --------- | ------- | ------------------------------------------------------ |
| `password-toggle`  | `boolean` | `true`  | Whether to render the show/hide reveal button.         |
| `password-visible` | `boolean` | `false` | Whether the value is currently revealed as plain text. |

> `type` is fixed to `password` (and switches to `text` while revealed); setting it has no effect.

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

## Accessibility

- The reveal button is a real `<button>` with an `aria-label` that flips between "Show password" and "Hide password", and an `aria-pressed` state, so its purpose and state are announced.
- Validation messages surface only once the field is `touched` (inherited from `form-field`).

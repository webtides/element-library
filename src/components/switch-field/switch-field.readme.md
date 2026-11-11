# SwitchField

`switch-field` is an on/off toggle. It renders a native `<input type="checkbox">` with `role="switch"` — so it is announced as a switch and submits with forms — behind a custom track/thumb. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is headless by default: without a theme the track falls back to a `currentColor` outline with a `currentColor` thumb.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/switch-field/define';
```

```html
<el-switch-field name="notifications" label="Enable notifications"></el-switch-field>
<el-switch-field name="darkmode" label="Dark mode" checked="true"></el-switch-field>
```

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name      | Type      | Default | Description                                                     |
| --------- | --------- | ------- | --------------------------------------------------------------- |
| `checked` | `boolean` | `false` | Whether the switch is on. Reflected to the `checked` attribute. |

#### Events

| Name           | Detail               | Description                          |
| -------------- | -------------------- | ------------------------------------ |
| `input-change` | `string` (the value) | Fired when the on/off state changes. |

#### CSS States

| Name      | Description                                                                              |
| --------- | ---------------------------------------------------------------------------------------- |
| `checked` | Present on the host while the switch is on. Style with `el-switch-field:state(checked)`. |
| `touched` | Set once the switch has been focused and blurred.                                        |
| `valid`   | Set while the field passes validation.                                                   |
| `invalid` | Set while the field fails validation.                                                    |

#### CSS Custom Properties

Headless by default; reads the library's `--el-*` design tokens (`--el-color-accent`, `--el-color-border`, `--el-color-bg`, `--el-space-2`, `--el-border-width`, `--el-focus-ring-width`, `--el-duration-md`, `--el-ease`, `--el-color-fg-muted`, `--el-color-danger`). Skin it via a theme — see the Storybook _Docs / Theming_ page.

On a touch screen (`@media (any-pointer: coarse)`) the label, which is the hit area of the switch, is at least `--el-touch-target` wide and high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- The native control is a `<input type="checkbox" role="switch">`, so it is announced as a switch with an on/off state and is keyboard-operable (Space toggles).
- The native input stays in the accessibility tree and focusable; it is only hidden visually, with keyboard focus reflected onto the custom track via `:focus-visible`.
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the switch while it is shown: a screen reader announces it when it appears and reads it again when the switch gets focus.

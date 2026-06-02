# Notification

`notification` is an alert / notification that can be shown **inline** or as a transient **toast**. It carries a semantic variant, a leading icon, an optional close button and optional auto-dismiss. The host is exposed as an ARIA live region, so toasts are announced when they appear. API modelled on Shoelace's `<sl-alert>`.

It is headless-leaning by default: colors come from the `--el-*` tokens, with system-color fallbacks (`Canvas` / `CanvasText`) so an unthemed floating toast is still readable.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/notification/define';
```

#### Inline

```html
<el-notification variant="success" open="true" closable="true"> Your changes have been saved. </el-notification>
```

#### As a toast

```js
const note = document.createElement('el-notification');
note.variant = 'success';
note.closable = true;
note.duration = 3000;
note.textContent = 'Saved to your library.';
note.toast(); // floats it into the shared top-right stack and shows it
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the notification is shown. Reflected to the `open` attribute. |
| `variant` | `'default' \| 'primary' \| 'success' \| 'neutral' \| 'warning' \| 'danger'` | `'default'` | Visual + semantic variant. |
| `closable` | `boolean` | `false` | Whether to render a close button. |
| `duration` | `number` | `Infinity` | Auto-dismiss delay in ms. Pauses while pointer/focus is inside. |

#### Methods

| Name      | Returns         | Description                                                  |
| --------- | --------------- | ------------------------------------------------------------ |
| `show()`  | `Promise<void>` | Shows the notification; resolves after the open transition.  |
| `hide()`  | `Promise<void>` | Hides the notification; resolves after the close transition. |
| `toast()` | `Promise<void>` | Moves it into the shared top-right toast stack and shows it. |

#### Events

| Name                      | Description                        |
| ------------------------- | ---------------------------------- |
| `notification-show`       | The notification starts to open.   |
| `notification-after-show` | The open transition has finished.  |
| `notification-hide`       | The notification starts to close.  |
| `notification-after-hide` | The close transition has finished. |

#### Slots

| Name        | Description                                           |
| ----------- | ----------------------------------------------------- |
| _(default)_ | The notification's message.                           |
| `icon`      | A leading icon. Falls back to a variant default icon. |

#### CSS Parts

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| `base`         | The animated outer wrapper.                      |
| `panel`        | The visual surface (background, border, accent). |
| `icon`         | The leading icon container.                      |
| `message`      | The message wrapper around the default slot.     |
| `close-button` | The optional close button.                       |

#### CSS States

| Name   | Description                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------- |
| `open` | Present on the host while the notification is shown. Style with `el-notification:state(open)`. |

#### CSS Custom Properties

Reads `--el-color-bg` / `--el-color-fg`, `--el-color-border`, the variant colors (`--el-color-accent` / `--el-color-success` / `--el-color-danger` / `--el-color-warning` / `--el-color-fg-muted`), `--el-radius-md`, `--el-shadow-lg`, `--el-space-*`, `--el-duration-md` and `--el-ease`. See the Storybook _Docs / Theming_ page.

## Accessibility

- The host is a live region: `role="alert"` + `aria-live="assertive"` for `danger` / `warning`, `role="status"` + `aria-live="polite"` otherwise — so a toast is announced when it appears.
- The auto-dismiss countdown pauses while the pointer or keyboard focus is inside the notification, so it can't disappear out from under someone reading or interacting with it.
- The close button is a real `<button>` with an accessible name.
- The transition collapses under `prefers-reduced-motion: reduce`.

# Dialog

`dialog` is a modal dialog built on the native `<dialog>` element. The platform handles focus trapping, making the background `inert`, top-layer rendering (no `z-index` juggling), focus restoration on close, and `<form method="dialog">` auto-close. On top of that the component adds an animated, cancelable open/close lifecycle and ref-counted body-scroll locking.

It is headless by default — without a theme it imposes no colors, borders, shadows or backdrop. Opt in by importing a theme (or setting the `--el-*` tokens yourself).

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/dialog/define';
```

```html
<button type="button" onclick="document.querySelector('el-dialog').show()">Open</button>

<el-dialog label="Confirm">
    <p>Are you sure you want to continue?</p>
    <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">Cancel</button>
    <button slot="footer" type="button" onclick="this.closest('el-dialog').hide()">OK</button>
</el-dialog>
```

Open and close it imperatively with the `show()` / `hide()` methods (both return a promise that resolves once the transition finishes), or by toggling the `open` attribute/property.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the dialog is open. Reflected to the `open` attribute. |
| `label` | `string` | `''` | The dialog's title (used when the `label` slot is empty); the accessible name when headless. |
| `no-header` | `boolean` | `false` | Removes the header (title and built-in close button). Reflected to the `no-header` attribute. |
| `close-label` | `string` | `'Close'` | Accessible label for the built-in close button. |

#### Methods

| Name                   | Returns         | Description                                                    |
| ---------------------- | --------------- | -------------------------------------------------------------- |
| `show()`               | `Promise<void>` | Opens the dialog; resolves after the open transition.          |
| `hide()`               | `Promise<void>` | Closes the dialog; resolves after the close transition.        |
| `requestClose(source)` | `void`          | Requests a close, emitting the cancelable request-close event. |

#### Events

| Name | Cancelable | Detail | Description |
| --- | --- | --- | --- |
| `dialog-show` | no | — | The dialog starts to open. |
| `dialog-after-show` | no | — | The open transition has finished. |
| `dialog-hide` | no | — | The dialog starts to close. |
| `dialog-after-hide` | no | — | The close transition has finished. |
| `dialog-initial-focus` | yes | — | Focus has moved into the dialog; prevent to override. |
| `dialog-request-close` | yes | `{ source: 'close-button' \| 'keyboard' \| 'overlay' }` | A close was requested; `preventDefault()` to keep open. |

#### Slots

| Name             | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| _(default)_      | The dialog's main content (body).                                |
| `label`          | The dialog's title. Takes precedence over the `label` attribute. |
| `header-actions` | Optional controls in the header, before the close button.        |
| `footer`         | Footer content, typically action buttons. Collapses when empty.  |

#### CSS Parts

| Name             | Description                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| `base`           | The native `<dialog>` — the panel surface. The overlay is its `::backdrop` pseudo. |
| `header`         | The header row (title, header actions, close button).                              |
| `title`          | The title heading.                                                                 |
| `header-actions` | The container for the `header-actions` slot.                                       |
| `close-button`   | The built-in close button.                                                         |
| `body`           | The scrollable body wrapping the default slot.                                     |
| `footer`         | The footer wrapping the `footer` slot.                                             |

#### CSS States

| Name   | Description                                                                       |
| ------ | --------------------------------------------------------------------------------- |
| `open` | Present on the host while the dialog is open. Style with `el-dialog:state(open)`. |

#### CSS Custom Properties

Headless by default; reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-lg`, `--el-shadow-lg`, `--el-space-4`, `--el-duration-md`, `--el-ease`). Two dialog-specific tokens fine-tune the surface:

| Name                             | Default       | Description                                 |
| -------------------------------- | ------------- | ------------------------------------------- |
| `--el-dialog-width`              | `31rem`       | The dialog's width.                         |
| `--el-dialog-overlay-background` | `transparent` | The `::backdrop` background.                |
| `--el-dialog-enter-offset`       | `0.5rem`      | Vertical offset the panel animates in from. |

See the Storybook _Docs / Theming_ page for the full token reference.

## Accessibility

- Opening calls `showModal()`, so focus is trapped, the rest of the page is `inert`, and focus is restored to the previously focused element on close.
- The dialog is labelled by its title; with `no-header`, set `label` to provide the accessible name.
- Initial focus honours the native `autofocus` attribute on a child. Listen for `dialog-initial-focus` and `preventDefault()` to manage focus yourself.
- `Escape` is routed through the cancelable `dialog-request-close` event so it can be blocked.
- Both shipped themes collapse the open/close transition under `prefers-reduced-motion: reduce`.

## Scroll locking

While a dialog is open, page scrolling is locked (ref-counted, so stacked dialogs cooperate). Hiding the scrollbar would normally widen the page and cause a layout shift, so the dialog pads the document by the removed scrollbar's width to keep the content steady. This is a no-op on overlay-scrollbar systems (e.g. macOS), where the scrollbar takes no layout space.

This compensation covers normal page content, but `position: fixed` elements pinned to the right edge (a floating action button, a sticky toolbar) are positioned against the viewport and still shift by the scrollbar width when it disappears. To avoid that entirely, reserve the scrollbar gutter on your document up front:

```css
:root {
    scrollbar-gutter: stable;
}
```

With the gutter always reserved, the scrollbar's space never changes between locked and unlocked, so neither the page nor fixed elements move.

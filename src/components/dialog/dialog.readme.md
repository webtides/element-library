# Dialog

`dialog` is a modal dialog built on the native `<dialog>` element. The platform handles focus trapping, making the background `inert`, top-layer rendering (no `z-index` juggling) and focus restoration on close. On top of that the component adds an animated, cancelable open/close lifecycle and ref-counted body-scroll locking, and it closes for a `<form method="dialog">` inside it.

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
| `show()`               | `Promise<void>` | Opens the dialog; resolves once it has come to rest.           |
| `hide()`               | `Promise<void>` | Closes the dialog; resolves once it has come to rest.          |
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

#### Opening and closing in quick succession

`open` can change while the dialog is on its way in or out, by a button that is clicked twice for example. The last value wins:

- A dialog that is closed on its way in turns back. One that is opened on its way out turns round and is shown again; it has kept the focus and the lock on the page.
- `dialog-after-show` and `dialog-after-hide` fire when the dialog has got there. A way that is cut short has none: after `dialog-show` comes `dialog-after-show` or `dialog-hide`, after `dialog-hide` comes `dialog-after-hide` or `dialog-show`. `dialog-initial-focus` fires when the platform has moved the focus, which it does not for a dialog that turns round.
- The promises of `show()` and `hide()` resolve when the dialog is at rest, and never reject. When the other call has overtaken, that is at the other end, so read `open` afterwards where it matters.
- A change of `open` takes effect with the next frame. Two changes before that which cancel each other do nothing.

#### Closing from a form

A form with `method="dialog"` inside the dialog closes it when it is submitted, as it does in a native `<dialog>`: by its submit button, by `Enter` in one of its fields, or by a button that belongs to it through the `form` attribute, in the footer for example. A button with `formmethod="dialog"` does the same in a form with another method.

```html
<el-dialog label="Rename">
    <form id="rename" method="dialog">
        <label>Name <input name="name" required /></label>
    </form>
    <button slot="footer" form="rename" value="cancel" formnovalidate>Cancel</button>
    <button slot="footer" form="rename" value="save">Save</button>
</el-dialog>
```

- Nothing is sent. Read the fields in a listener of `submit`; `event.submitter` is the button that was used. There is no `returnValue`.
- A form that is not valid is not submitted, so the dialog stays open. A button with `formnovalidate` skips the validation.
- It closes without `dialog-request-close`. A listener that calls `preventDefault()` on the `submit` keeps the dialog open.
- An `el-button` of the type `submit` closes the dialog from inside the form. It has no `form` attribute, so a button in the footer for a form in the body has to be a native one.
- In a dialog inside a dialog, the form closes the one it is in.
- `form.submit()` from a script fires no `submit`, so the dialog stays open; call `hide()` there. The same goes for a form inside the shadow root of another component, whose `submit` does not leave it.

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

On a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high. Its icon keeps its size, and the header grows with the button. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- Opening calls `showModal()`, so focus is trapped, the rest of the page is `inert`, and focus is restored to the previously focused element on close.
- The dialog is labelled by its title; with `no-header`, set `label` to provide the accessible name.
- Initial focus honours the native `autofocus` attribute on a child. Listen for `dialog-initial-focus` and `preventDefault()` to manage focus yourself.
- `Escape` is routed through the cancelable `dialog-request-close` event so it can be blocked.
- Both shipped themes collapse the open/close transition under `prefers-reduced-motion: reduce`.

## Scroll locking

While a dialog is open, page scrolling is locked (ref-counted, so stacked dialogs cooperate). A dialog that is taken out of the page while it is open gives its lock back, and opens as a modal again when it is put back while `open`. Hiding the scrollbar would normally widen the page and cause a layout shift, so the dialog pads the document by the removed scrollbar's width to keep the content steady. This is a no-op on overlay-scrollbar systems (e.g. macOS), where the scrollbar takes no layout space.

This compensation covers normal page content, but `position: fixed` elements pinned to the right edge (a floating action button, a sticky toolbar) are positioned against the viewport and still shift by the scrollbar width when it disappears. To avoid that entirely, reserve the scrollbar gutter on your document up front:

```css
:root {
    scrollbar-gutter: stable;
}
```

With the gutter always reserved, the scrollbar's space never changes between locked and unlocked, so neither the page nor fixed elements move.

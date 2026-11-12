# Drawer

`drawer` is a panel that slides in from an edge of the viewport and lies over the page: for a navigation, a filter, the details of a row. While it is open the page behind it cannot be used.

It is `el-dialog` at another place, a modal built on the native `<dialog>` element. The platform keeps the focus inside, makes the page behind it `inert`, renders it in the top layer (no `z-index` to manage) and gives the focus back when it closes. The component adds the edge it comes from, the slide, a close that a listener can refuse, and the lock on the scrolling of the page.

Without a theme the drawer paints nothing: no background, no border, no shadow, no backdrop. Import a theme, or set the `--el-*` tokens yourself.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/drawer/define';
```

```html
<button type="button" onclick="document.querySelector('el-drawer').show()">Filters</button>

<el-drawer label="Filters">
    <p>The content of the drawer.</p>
    <button slot="footer" type="button" onclick="this.closest('el-drawer').hide()">Cancel</button>
    <button slot="footer" type="button" onclick="this.closest('el-drawer').hide()">Apply</button>
</el-drawer>

<!-- A navigation at the start -->
<el-drawer label="Menu" placement="start">
    <nav aria-label="Main">…</nav>
</el-drawer>
```

Open and close it with `show()` and `hide()`, which both return a promise that resolves once the drawer has come to rest, or with the `open` attribute or property.

> Boolean attributes are passed as strings (`no-header="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the drawer is open. Reflected to the `open` attribute. |
| `label` | `string` | `''` | The title of the drawer (used when the `label` slot is empty), and its accessible name with `no-header`. |
| `placement` | `string` | `'end'` | The edge the drawer comes from: `start`, `end`, `top` or `bottom`. Reflected to the `placement` attribute. |
| `no-header` | `boolean` | `false` | Removes the header (title and close button). Reflected to the `no-header` attribute. |
| `close-label` | `string` | `'Close'` | Accessible label of the close button. |

The properties of the last two are `noHeader` and `closeLabel`.

#### Methods

| Name                   | Returns         | Description                                                         |
| ---------------------- | --------------- | ------------------------------------------------------------------- |
| `show()`               | `Promise<void>` | Opens the drawer. Resolves once it has come to rest.                |
| `hide()`               | `Promise<void>` | Closes the drawer. Resolves once it has come to rest.               |
| `requestClose(source)` | `void`          | Asks for a close with `drawer-request-close`, which can be refused. |

#### Events

| Name | Cancelable | Detail | Description |
| --- | --- | --- | --- |
| `drawer-show` | no |  | The drawer starts to open. |
| `drawer-after-show` | no |  | The drawer has slid in. |
| `drawer-hide` | no |  | The drawer starts to close. |
| `drawer-after-hide` | no |  | The drawer has slid out. |
| `drawer-initial-focus` | no |  | The focus has moved into the drawer. Move it in a listener to have it elsewhere. |
| `drawer-request-close` | yes | `{ source: 'close-button' \| 'keyboard' \| 'overlay' }` | A close was asked for. `preventDefault()` keeps the drawer open. |

All of them bubble and cross shadow boundaries.

#### Slots

| Name             | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| _(default)_      | The content of the drawer (body).                             |
| `label`          | The title. Takes precedence over the `label` attribute.       |
| `header-actions` | Controls in the header, before the close button.              |
| `footer`         | The footer, for buttons as a rule. Left out when it is empty. |

#### CSS Parts

| Name             | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `base`           | The native `<dialog>`: the surface of the drawer. The backdrop is its `::backdrop`. |
| `header`         | The header row (title, header actions, close button).                               |
| `title`          | The title heading.                                                                  |
| `header-actions` | The container of the `header-actions` slot.                                         |
| `close-button`   | The close button.                                                                   |
| `body`           | The body with the default slot. It scrolls when the content is longer.              |
| `footer`         | The footer with the `footer` slot.                                                  |

#### CSS States

| Name   | Description                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| `open` | Present on the element while the drawer is open. Style with `el-drawer:state(open)`. |

#### CSS Custom Properties

The surface reads `--el-color-bg`, `--el-color-fg` and `--el-shadow-lg`, and for the border on the edge that faces the page `--el-border-width` and `--el-color-border`. The parts read `--el-space-2` and `--el-space-4`, `--el-font-size-lg`, `--el-font-weight-semibold` and `--el-radius-md` (the close button). The slide takes `--el-duration-md` with `--el-ease`.

| Name | Default | Description |
| --- | --- | --- |
| `--el-drawer-size` | `25rem` at the start and the end, the height of the content at the top and the bottom | The width of a drawer at the start or the end, the height of one at the top or the bottom. |
| `--el-dialog-overlay-background` | `transparent` | The background of the backdrop. The drawer shares it with `el-dialog`, so a theme sets one. |

The drawer has square corners and no border on the edges it lies against. To change the surface, style the part:

```css
el-drawer {
    --el-drawer-size: 20rem;
}

el-drawer::part(base) {
    border-radius: 1rem 0 0 1rem;
}
```

On a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high. Its icon keeps its size, and the header grows with the button. Without that token, and on a fine pointer, the sizes stay as they are.

## Placement

`placement` names the edge of the viewport the drawer lies along and slides in from.

- `start` and `end` are the two ends of a line of text: left and right, and the other way round in a right-to-left page (`dir="rtl"` on the page, on an element around the drawer or on the drawer). The drawer goes from the top of the viewport to the bottom and is `--el-drawer-size` wide.
- `top` and `bottom` go across the viewport. The drawer is as high as its content, or `--el-drawer-size` high when that is set.
- A placement that is none of the four is `end`.

The drawer is never wider or higher than the viewport. On a narrow screen a drawer at the start or the end covers the page, and the close button is the way back.

A page that reaches under the notch and the home indicator of a phone (`viewport-fit=cover`) keeps the content of the drawer clear of them itself:

```css
el-drawer::part(base) {
    padding-block-end: env(safe-area-inset-bottom);
}
```

## Opening and closing

- `show()`, or `open` set, opens the drawer. `hide()`, or `open` taken back, closes it, whatever a listener says.
- **The close button**, **`Escape`** and **a click on the backdrop** ask for a close: they fire `drawer-request-close` with what asked in `detail.source`. A listener that calls `preventDefault()` keeps the drawer open, to protect unsaved input for example. The drawer then grows a little for a moment, to show that the request arrived. `requestClose(source)` asks the same from a script.
- The drawer slides in `--el-duration-md`. Without that token, and for a user who prefers reduced motion, it is in its place at once.
- `open` can change while the drawer slides, by a button that is clicked twice for example. The last value wins: a drawer that is closed on its way in turns back, one that is opened on its way out turns round. `drawer-after-show` and `drawer-after-hide` fire when the drawer has got there, so a way that is cut short has none: after `drawer-show` comes `drawer-after-show` or `drawer-hide`, after `drawer-hide` comes `drawer-after-hide` or `drawer-show`. The promises of `show()` and `hide()` resolve when the drawer is at rest, at whichever end, and never reject.
- A `<form method="dialog">` inside the drawer does not close it: the form is in the page, the `<dialog>` in the shadow root. Close the drawer from the `submit` listener.

## Focus

When the drawer opens, the platform moves the focus into it: to the element in it that has the `autofocus` attribute, or else to the first one that takes the focus, which is the close button. To have the focus somewhere else, move it in a listener of `drawer-initial-focus`.

The focus of the keyboard stays inside the drawer while it is open, and goes back to the element that had it when the drawer closes.

## Scroll locking

While a drawer is open the page does not scroll. The lock counts its holders, so a drawer and a dialog that are open at the same time work together. Hiding the scrollbar would make the page wider and move its content, so the lock pads the document by the width of the scrollbar it took away. Elements that are fixed to the right edge still move by that width; reserve the room for the scrollbar up front to avoid it:

```css
:root {
    scrollbar-gutter: stable;
}
```

A drawer that is taken out of the page while it is open gives its lock back, and opens again when it is put back while `open`.

## Accessibility

- The drawer is a dialog for a screen reader, with its title as its name. With `no-header` set `label`, which names it then.
- It opens with `showModal()`: the focus stays inside, the rest of the page is `inert`, and the focus goes back where it was when the drawer closes.
- `Escape` closes it, through `drawer-request-close`.
- The close button has the name `Close`. Set `close-label` for another language.
- Give a drawer without a header a way to close it that a pointer can use.
- A navigation in a drawer stays a `<nav>` of the page, with a name of its own (`aria-label`).

## Server-side rendering

The closed drawer is part of the server-rendered markup (Declarative Shadow DOM). A `<dialog>` that is not open is not shown, so nothing flashes before the JavaScript has loaded. Opening needs the JavaScript: a drawer with `open` in the markup opens when its element is defined.

Without server-side rendering the content of a drawer is in the page until its element is defined. Hide it until then:

```css
el-drawer:not(:defined) {
    display: none;
}
```

## Browser support

The drawer needs the native `<dialog>` element and custom states (`:state()`): Chrome 125, Firefox 126, Safari 17.4.

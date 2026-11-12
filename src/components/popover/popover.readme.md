# Popover

`popover` is a panel that floats next to an anchor. A click on the anchor opens it; a second click, a click beside it or `Escape` closes it.

It is built on the native popover of the platform (`popover="auto"`), which owns the top layer, the closing and the keyboard: nothing clips the panel or lies on top of it, whatever `overflow` or `z-index` its surroundings have. The component adds the anchor and the place of the panel, which it computes with [Floating UI](https://floating-ui.com): at the side of the anchor that `placement` names, on the other side when there is no room, and never outside the viewport.

Without a theme imported the panel has the system colours for its surface and its text, so that it can be read over the page.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/popover/define';
```

```html
<el-popover>
    <button slot="anchor" type="button">Options</button>
    <p>The content of the panel.</p>
</el-popover>

<!-- Above the anchor, aligned with its start, with an arrow -->
<el-popover placement="top-start" arrow="true">
    <button slot="anchor" type="button">Help</button>
    <p>Any content, links and controls included.</p>
</el-popover>
```

> Boolean attributes are passed as strings (`arrow="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name        | Type      | Default    | Description                                                                   |
| ----------- | --------- | ---------- | ----------------------------------------------------------------------------- |
| `open`      | `boolean` | `false`    | Whether the panel is shown. Reflected to the `open` attribute.                |
| `placement` | `string`  | `'bottom'` | `top`, `bottom`, `left` or `right`, each also with `-start` or `-end`.        |
| `distance`  | `number`  | `8`        | The gap between the anchor and the panel, or the tip of its arrow, in pixels. |
| `arrow`     | `boolean` | `false`    | Whether the panel has an arrow that points to the anchor.                     |

#### Methods

| Name       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `show()`   | Opens the panel.                                        |
| `hide()`   | Closes the panel.                                       |
| `toggle()` | Opens the panel when it is closed, closes it when open. |

#### Events

| Name           | Description           |
| -------------- | --------------------- |
| `popover-show` | The panel has opened. |
| `popover-hide` | The panel has closed. |

Both bubble and cross shadow boundaries. They fire for every way of opening and closing: the anchor, the methods, the `open` property, `Escape`, a click beside the panel.

#### Slots

| Name        | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| _(default)_ | The content of the panel.                                            |
| `anchor`    | The element the panel belongs to and opens from, a button as a rule. |

#### CSS Parts

| Name     | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `anchor` | The `<slot>` holding the anchor.                                  |
| `panel`  | The floating panel: background, border, radius, elevation, width. |
| `arrow`  | The arrow (present only while `arrow`).                           |

#### CSS States

| Name   | Description                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| `open` | Present on the host while the panel is shown. Style with `el-popover:state(open)`. |

#### CSS Custom Properties

The panel reads `--el-color-bg` and `--el-color-fg` (the system colours `Canvas` and `CanvasText` without a theme), `--el-color-border`, `--el-border-width`, `--el-radius-lg`, `--el-space-3` for its padding and `--el-shadow-lg`. The arrow has the surface and the border of the panel.

The panel is as wide as its content, up to `20rem`, and never wider than the viewport. Change that on the part:

```css
el-popover::part(panel) {
    max-width: 30rem;
}
```

## Placement

`placement` names the side of the anchor: `top`, `bottom`, `left` or `right`. On that side the panel is centred on the anchor; with `-start` or `-end` it is aligned with that edge of the anchor instead (`bottom-start`: below, left edges in line, in a left-to-right page).

The placement is a wish. The panel goes to the opposite side when it has no room on its own, and it is pushed back along the edge of the viewport when it would leave it, to 8 px from the edge. The arrow stays on the anchor through both.

While the panel is open it follows its anchor: when the page or a box around it scrolls, when the window is resized, when the anchor or the panel changes its size. Nothing is computed while it is closed.

`distance` is the gap between the anchor and the panel in pixels. With an arrow it is the gap between the anchor and the tip of the arrow.

## Opening and closing

- A click on the anchor opens and closes the panel. That includes Enter and Space on an anchor that is a button.
- `Escape` and a click beside the panel close it. The platform does that, as for every native popover.
- One popover is open at a time: opening another one closes this one. A popover inside the panel of another one keeps its parent open.
- `open`, `show()`, `hide()` and `toggle()` do the same from a script. A popover with `open="true"` is open from the start, once its JavaScript has run.

The component has no hover mode and does not open on focus.

## Accessibility

- Use a `<button>` as the anchor. It is what a keyboard can reach and activate, and the popover writes `aria-expanded` onto it, so that a screen reader announces whether the panel is open. A link, an element with a role of its own and a custom element get the attribute as well; an element that cannot carry it, a `<span>` for example, does not.
- With an `el-button` as the anchor, the attribute is on the element and not on the control inside it, so a screen reader does not announce the state yet.
- The panel has no role. Its content comes right after the anchor in the page, for the keyboard and for a screen reader: Tab from the anchor goes into the panel. The focus is not moved when the panel opens.
- `Escape` closes the panel. If the focus was inside it, it goes back to the anchor. After a click beside the panel the focus stays where the click put it.
- The component adds nothing that takes the focus itself, so the focus ring is the one of the anchor and of the content.

## Server-side rendering

The anchor and the closed panel are part of the server-rendered markup (Declarative Shadow DOM). The panel is a native popover and stays hidden until it is opened, so nothing flashes before the JavaScript has loaded. Opening and placing need the JavaScript: a popover that is rendered with `open="true"` appears when its element is defined.

## Browser support

The popover needs the native Popover API: Chrome 114, Firefox 125, Safari 17. The place of the panel is computed in script, so it does not depend on CSS anchor positioning.

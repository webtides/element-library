# Tooltip

`tooltip` is a short text that explains another element, its anchor. It appears next to the anchor while the pointer rests on it or while it has the focus of the keyboard, and `Escape` closes it.

The tooltip stands next to its anchor in the page and names it by id with `for`, the way a `<label>` names its field. It is the description of the anchor for a screen reader (`aria-describedby`), whether it is open or not.

The element is a native popover of the platform (`popover="manual"`), which owns the top layer: nothing clips the tooltip or lies on top of it, whatever `overflow` or `z-index` its surroundings have. The component adds the opening and closing and the place, which it computes with [Floating UI](https://floating-ui.com): at the side of the anchor that `placement` names, on the other side when there is no room, and never outside the viewport.

Without a theme imported the tooltip has the system colours, the other way round: the text colour as its background.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tooltip/define';
```

```html
<button id="save" type="button">Save</button>
<el-tooltip for="save">Saves the document</el-tooltip>

<!-- Below the anchor, with an arrow -->
<el-button id="archive">Archive</el-button>
<el-tooltip for="archive" placement="bottom" arrow="true">Moves the project to the archive</el-tooltip>

<!-- An icon button: the name is on the button, the tooltip adds to it -->
<el-button id="bold" circle="true" aria-label="Bold"><strong>B</strong></el-button>
<el-tooltip for="bold">Makes the selection bold</el-tooltip>
```

> Boolean attributes are passed as strings (`arrow="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `for` | `string` | `''` | The id of the anchor, in the document or the shadow root the tooltip is in. |
| `open` | `boolean` | `false` | Whether the tooltip is shown. Reflected to the `open` attribute. |
| `placement` | `string` | `'top'` | `top`, `bottom`, `left` or `right`, each also with `-start` or `-end`. |
| `distance` | `number` | `8` | The gap between the anchor and the tooltip, or the tip of its arrow, in pixels. |
| `show-delay` | `number` | `150` | How long the pointer has to rest on the anchor before the tooltip opens, in milliseconds. |
| `hide-delay` | `number` | `0` | How long the tooltip stays after the pointer has left, in milliseconds. |
| `arrow` | `boolean` | `false` | Whether the tooltip has an arrow that points to the anchor. |
| `disabled` | `boolean` | `false` | Takes the pointer and the focus out of it: the tooltip opens and closes for a script only. |

The properties of the two delays are `showDelay` and `hideDelay`.

#### Methods

| Name     | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `show()` | Opens the tooltip. Without an anchor in the page it stays closed. |
| `hide()` | Closes the tooltip.                                               |

#### Events

| Name           | Description             |
| -------------- | ----------------------- |
| `tooltip-show` | The tooltip has opened. |
| `tooltip-hide` | The tooltip has closed. |

Both bubble and cross shadow boundaries. They fire for every way of opening and closing: the pointer, the focus, `Escape`, the methods, the `open` property.

#### Slots

| Name        | Description              |
| ----------- | ------------------------ |
| _(default)_ | The text of the tooltip. |

#### CSS Parts

| Name    | Description                                                           |
| ------- | --------------------------------------------------------------------- |
| `body`  | The surface of the tooltip: background, text colour, padding, radius. |
| `arrow` | The arrow (present only while `arrow`).                               |

#### CSS States

| Name   | Description                                                                             |
| ------ | --------------------------------------------------------------------------------------- |
| `open` | Present on the element while the tooltip is shown. Style with `el-tooltip:state(open)`. |

#### CSS Custom Properties

The body reads `--el-color-fg` for its background and `--el-color-bg` for its text (the system colours `CanvasText` and `Canvas` without a theme), `--el-space-1` and `--el-space-2` for its padding, `--el-radius-md`, `--el-border-width`, `--el-font-family`, `--el-font-size-sm` and `--el-line-height`. The arrow has the surface of the body.

The border of the body is transparent. It shows when a user forces colours (Windows contrast themes), where a background is not painted.

The look is on the part, the width on the element. A tooltip is as wide as its text, up to `20rem`, and never wider than the viewport:

```css
el-tooltip {
    max-width: 30rem;
}

el-tooltip::part(body) {
    background: var(--el-color-accent);
    border-radius: 999px;
}
```

The element itself is only the box that is placed. It has no padding, border or background of its own, so a reset of the page that selects every element (`* { padding: 0 }`) does not change the tooltip.

## Placement

`placement` names the side of the anchor: `top`, `bottom`, `left` or `right`. On that side the tooltip is centred on the anchor; with `-start` or `-end` it is aligned with that edge of the anchor instead.

The placement is a wish. The tooltip goes to the opposite side when it has no room on its own, and it is pushed back along the edge of the viewport when it would leave it, to 8 px from the edge. The arrow stays on the anchor through both.

While the tooltip is open it follows its anchor: when the page or a box around it scrolls, when the window is resized, when the anchor or the tooltip changes its size. Nothing is computed while it is closed.

`distance` is the gap between the anchor and the tooltip in pixels. With an arrow it is the gap between the anchor and the tip of the arrow.

## Opening and closing

- **The pointer** opens the tooltip when it rests on the anchor for `show-delay`, and closes it when it leaves, after `hide-delay`. A pointer that only passes over the anchor opens nothing.
- The pointer can go from the anchor onto the tooltip, to read a long text or to select it: the gap between the two belongs to the tooltip, and it stays while the pointer is on either.
- **The focus of the keyboard** opens the tooltip at once, without the delay, and it closes when the focus moves on. A button that was clicked keeps the focus, but that does not hold the tooltip open: it goes when the pointer leaves.
- **`Escape`** closes the tooltip, wherever the focus is. It stays closed until the pointer or the focus comes to the anchor anew. The tooltip takes that key press: a dialog or a popover around the anchor stays open, and the next `Escape` is for it.
- **A finger** opens nothing: a touch screen has no hover, and the tooltip would appear together with the press on the anchor. Do not put into a tooltip what a user cannot do without.
- `open`, `show()` and `hide()` do the same from a script. A tooltip that a script has opened closes like any other, when the pointer leaves its anchor for example. With `disabled` the pointer and the focus neither open nor close it, and it is left to the script; `Escape` still closes it.
- A tooltip that is taken out of the page closes, and is closed when it comes back. One whose `for` changes closes as well.

## The anchor

The anchor is the element whose id `for` names. The tooltip looks it up in the document, or in the shadow root it is in itself, when it is connected, when `for` changes and when it is opened. An anchor that is put into the page later than its tooltip is found with the next `show()`, or when `for` is set again; one that is replaced by another element with the same id is not noticed.

Any element can be the anchor. One that takes the focus (a button, a link, a field) is what a keyboard can reach. Several tooltips can name the same anchor, and one anchor can have a tooltip and be the anchor of an `el-popover`.

Without an anchor in the page the tooltip does not open.

## Accessibility

- The tooltip adds its id to the `aria-describedby` of its anchor and keeps what is there. A screen reader reads the text of the tooltip after the name of the anchor, also while the tooltip is closed. A tooltip without an id gets one (`el-tooltip-1`).
- The tooltip is a description, not a name. A button that shows only an icon needs `aria-label` as well.
- An `el-button` as the anchor passes the description on to the control inside it.
- The element has the role `tooltip`.
- Put text into a tooltip, no links and no controls: the focus does not go into it, and it closes when the focus leaves the anchor. Content to interact with belongs into an `el-popover`.
- The tooltip can be dismissed with `Escape`, hovered, and it stays until the pointer or the focus leaves or the user closes it (WCAG 1.4.13, Content on Hover or Focus).
- `disabled` only keeps the tooltip from opening. It stays the description of its anchor.

## Server-side rendering

The text of the tooltip is content of the page, and the closed tooltip is part of the server-rendered markup (Declarative Shadow DOM). Its stylesheet hides it until it is opened, so nothing flashes before the JavaScript has loaded. Opening, placing and the `aria-describedby` on the anchor need the JavaScript. To have the description without it, write it yourself:

```html
<button id="save" type="button" aria-describedby="save-hint">Save</button>
<el-tooltip id="save-hint" for="save">Saves the document</el-tooltip>
```

Without server-side rendering the text of a tooltip is in the page until its element is defined. Hide it until then:

```css
el-tooltip:not(:defined) {
    display: none;
}
```

## Browser support

The tooltip needs the native Popover API: Chrome 114, Firefox 125, Safari 17. Its place is computed in script, so it does not depend on CSS anchor positioning.

With an `el-button` as the anchor the description reaches the control through ARIA element references: Chrome 135, Firefox 136, Safari 16.4.

# Splitter

`splitter` is the edge between two panes that are beside each other, which the user drags to set the width of one of them: more room for long names in a list, or less of it for more of what is chosen from the list. It is dragged with a mouse, a finger or a pen, and moved with the arrow keys.

The splitter is the control and sizes nothing itself, as a range does: it has a `value` between `min` and `max`, the width in pixels, and tells of every change. The layout around it takes the value. An [`el-app-frame`](../app-frame/app-frame.readme.md) has one at the edge of its navigation and of its aside (`resizable`); a page with two panes of its own writes one between them.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/splitter/define';
```

```html
<div class="panes" style="--list: 320px">
    <el-list label="Messages">…</el-list>
    <el-splitter label="Messages" value="320" min="200" max="480"></el-splitter>
    <article>…</article>
</div>
```

```css
.panes {
    display: grid;
    grid-template-columns: var(--list) auto minmax(0, 1fr);
}
```

```js
const panes = document.querySelector('.panes');

panes.addEventListener('splitter-resize', (event) => {
    panes.style.setProperty('--list', `${event.detail.value}px`);
});
panes.addEventListener('splitter-resize-end', (event) => {
    localStorage.setItem('list', event.detail.value);
});
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | The width of the pane the splitter sizes, in pixels. |
| `min` | `number` | `0` | The least width. |
| `max` | `number` | `100` | The greatest width. |
| `step` | `number` | `16` | How far an arrow key moves the edge, in pixels. |
| `label` | `string` | `''` | The name of what the splitter sizes, for assistive technology. |
| `placement` | `'start' \| 'end'` | `'end'` | The edge of its pane the splitter is. `end`: the pane is in front of it. `start`: the pane is after it. |

#### Methods

_None._

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `splitter-resize` | `{ value: number }` | Fired with every change the user makes: while the edge is dragged, and with every key. |
| `splitter-resize-end` | `{ value: number }` | Fired once the user has set a width: when the pointer lets go of the edge, and with every key. The width to keep. |

#### Slots

_None._

#### CSS Parts

| Name   | Description                                                                        |
| ------ | ---------------------------------------------------------------------------------- |
| `base` | The separator: what takes the pointer and the focus. It is wider than the line.    |
| `line` | The line that shows, and the mark it becomes under the pointer and with the focus. |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-splitter-line-width` | `--el-border-width` | The width of the line. `0px` for an edge that lies on a line the layout draws itself. |

Reads `--el-color-border` and `--el-border-width` for its line, `--el-color-accent` for the mark, `--el-focus-ring-width` and `--el-color-focus-ring` for the focus ring, `--el-space-2` for the width of what takes the pointer, `--el-duration-md` and `--el-ease` for the way from the line to the mark, and `--el-touch-target` on a touch screen.

#### States

| Name       | Description                         |
| ---------- | ----------------------------------- |
| `dragging` | Set while a pointer drags the edge. |

## The value, and who takes it

The splitter has the width of one pane as its `value`, in pixels. It does not know the pane and writes nothing onto it.

- The page gives the width it starts with, and the least and the greatest one: `value`, `min`, `max`. A value outside of the two is said as the nearer of them.
- While the user changes the width, `splitter-resize` tells of every one. The page sets it on its layout, a custom property of a grid for example. A page that is slow to do so loses nothing: the edge follows the pointer, not the layout.
- `splitter-resize-end` tells of the width that stays. That is the moment to keep it, in the storage of the browser or on the server.
- A width the page sets on the splitter (`value`) tells of nothing.

The splitter is as wide as its line and as high as the row it is in: a flex row or a grid row stretches it. It sizes a width. Two panes above each other are not what it is for.

## Which pane it sizes

`placement` says at which edge of its pane the splitter is. That decides in which direction the width grows.

```html
<!-- The pane is in front of the splitter: a list at the start. -->
<el-list>…</el-list>
<el-splitter label="Messages" …></el-splitter>
<article>…</article>

<!-- The pane is after it: details at the end. -->
<article>…</article>
<el-splitter placement="start" label="Details" …></el-splitter>
<aside>…</aside>
```

In a right-to-left page start and end are the other way around, and so are the drag and the arrow keys.

## Keeping a width

A server-rendered page that has kept a width writes it in two places: on its layout, and as the `value` of the splitter. Nothing jumps then: the layout has the width before the script has run, and the splitter says the same one when it starts.

```html
<div class="panes" style="--list: 280px">
    …
    <el-splitter label="Messages" value="280" min="200" max="480"></el-splitter>
    …
</div>
```

## Pointer

- The edge is a thin line. It takes the pointer in a wider area around it, which lies over the panes at both sides: `--el-space-2` wide, and at least `--el-touch-target` on a touch screen.
- While the edge is dragged, no text is selected and a finger does not scroll the page.
- The edge keeps following the pointer wherever it goes. It captures the pointer, and it covers the viewport while it is dragged: a page in the page (an `iframe`) under the pointer would take a pen away from it.
- Only the main button of a mouse takes the edge.

## Keyboard

| Key                        | What it does                                                   |
| -------------------------- | -------------------------------------------------------------- |
| `Tab`                      | The edge is a stop of the Tab key.                             |
| `ArrowLeft` / `ArrowRight` | Move the edge by `step` pixels, in the direction of the arrow. |
| `Home`                     | The least width.                                               |
| `End`                      | The greatest width.                                            |

Every key is a width that stays: it fires `splitter-resize` and `splitter-resize-end`.

## Server-side rendering

The splitter renders on a server with `@webtides/element-js-ssr-renderer`: the separator with its name and its value is in the markup, and the line looks the same before and after the element takes over. It moves once the script has run.

## Accessibility

- A separator that takes the focus (`role="separator"` with `tabindex="0"`), with `aria-orientation="vertical"`, the width as `aria-valuenow` and the limits as `aria-valuemin` and `aria-valuemax`.
- `label` is its name: what it sizes ("Messages"), not what it is.
- The keyboard focus shows as a ring around what takes the pointer, and the line is the mark it is under the pointer.
- The line is a border: it stays where the user forces colours, and it is there without a theme then. Without a theme and without forced colours the line has no width, and shows as a mark under the pointer and with the focus.

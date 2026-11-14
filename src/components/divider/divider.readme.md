# Divider

`divider` is a line between two groups of content: the regions of a card, the entries of a menu, the controls of a toolbar. It is horizontal by default and vertical with `orientation`.

The line has the colour and the width of the borders of the theme. Without a theme imported it is `1px` in a fifth of the text colour, so it shows on any background.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/divider/define';
```

```html
<p>Billing address</p>
<el-divider></el-divider>
<p>Shipping address</p>

<!-- Between the controls of a row -->
<div style="display: flex; gap: 1rem">
    <a href="/edit">Edit</a>
    <el-divider orientation="vertical"></el-divider>
    <a href="/remove">Remove</a>
</div>
```

## API

#### Properties/Attributes

| Name          | Type     | Default        | Description                            |
| ------------- | -------- | -------------- | -------------------------------------- |
| `orientation` | `string` | `'horizontal'` | `horizontal` or `vertical`. Reflected. |

#### Methods

_None._

#### Events

_None._

#### Slots

_None._

#### CSS Parts

| Name   | Description         |
| ------ | ------------------- |
| `base` | The line, an `<hr>` |

#### CSS Custom Properties

| Name                 | Default                                                         | Description                |
| -------------------- | --------------------------------------------------------------- | -------------------------- |
| `--el-divider-color` | `--el-color-border`, a fifth of the text colour without a theme | The colour of the line.    |
| `--el-divider-width` | `--el-border-width`, `1px` without a theme                      | The thickness of the line. |

## Space around the line

A divider has no space around it. Where it stands in a layout with a `gap`, the gap is the distance to the content on both sides. Anywhere else, set a margin on the element:

```css
el-divider {
    margin-block: 1.5rem;
}

el-divider[orientation='vertical'] {
    margin-block: 0;
    margin-inline: 0.75rem;
}
```

## Orientation

A horizontal divider is as wide as its container.

A vertical divider is as high as the row it stands in: in a flex or grid container it stretches to the height of the row, whatever `align-items` says for the other items. In a line of text it is as high as the text (`1em`). For any other height, set one on the element.

`orientation` is reflected: the element writes it onto itself as an attribute, the default included (`<el-divider orientation="horizontal">`), so that it can be selected from a stylesheet. A value other than `vertical` gives a horizontal line.

The `hidden` attribute hides the divider.

## Accessibility

- The line is a native `<hr>`, which is a separator to assistive technology: a screen reader can announce it and tell its user that a new group begins. A vertical divider says so with `aria-orientation`.
- Where the line is decoration only (the groups are told apart by headings, or the items of the row are a list anyway), put `aria-hidden="true"` on the element, so that a screen reader does not announce it.
- The line is a border, not a background. It stays when colours are forced (the contrast themes of Windows), repainted in the text colour of the system.
- The fallback colour without a theme is faint on purpose. A line that carries meaning on its own, without a heading or a space that says the same, needs a contrast of 3 : 1 against the background: set `--el-divider-color`.

## Server-side rendering

The line and its orientation are part of the server-rendered markup (Declarative Shadow DOM), so the divider shows before its JavaScript has loaded, and without JavaScript.

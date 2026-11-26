# TreeItem

`tree-item` is one entry of an [`el-tree`](../tree/tree.readme.md), and the entries below it. It has the parts of a row of a list: an icon at the start, its name, a count at the end. With `href` the name is a link. An entry with entries below it opens and closes.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tree/define';
import '@webtides/element-library/tree-item/define';
```

```html
<el-tree label="Folders">
    <el-tree-item label="Inbox" href="/inbox" open="true">
        <el-svg-use slot="start" name="folder" aria-hidden="true"></el-svg-use>
        <span slot="end">12</span>

        <el-tree-item label="Work" href="/inbox/work" current="true"></el-tree-item>
        <el-tree-item label="Private" href="/inbox/private"></el-tree-item>
    </el-tree-item>
</el-tree>
```

The entries below an entry are the `el-tree-item` elements the page writes into it, to any depth.

> Boolean attributes are passed as strings (`open="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `''` | The name of the entry. |
| `href` | `string` | `''` | The address the entry leads to. Unset, the entry is no link. |
| `target` | `string` | `''` | Where to open the address (only with `href`). |
| `rel` | `string` | `'noreferrer noopener'` | `rel` attribute for the link, written when `target` is set. |
| `current` | `boolean` | `false` | The entry is the one of the page the user is on. |
| `open` | `boolean` | `false` | Whether the entries below this one are shown. Reflected to the `open` attribute, which the stylesheet reads. |

`hasItems` (read only) says whether the entry has entries below it.

#### Methods

| Name | Description |
| --- | --- |
| `toggle(open?)` | Opens or closes the entry, as its button does, and fires `tree-item-toggle`. Without an argument it goes to the other state. An entry without entries below it stays as it is. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `tree-item-toggle` | `{ open: boolean }` | Fired when the user has opened or closed the entry, with its button or with the arrow keys. Not fired when `open` is set from a script. It bubbles, through the entries above and the tree: look at `event.target`. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The entries below this one: `el-tree-item` elements. |
| `label` | The name of the entry. Takes precedence over the `label` attribute. |
| `start` | What stands in front of the name: an icon. |
| `end` | What stands at the end of the row: a count. In an entry that is a link it is part of the target of the link. |

#### CSS Parts

| Name | Description |
| --- | --- |
| `base` | The entry: an item of the list it is in. |
| `row` | The row of the entry: its button, its start, its name and its end. |
| `toggle` | The button that opens and closes the entries below, on an entry that is a link and has such entries. |
| `start` | The region of the `start` slot. |
| `label` | The name: an `<a>` with `href`; without, a `<button>` when the entry has entries below it, and a `<span>` when it has none. |
| `end` | The region of the `end` slot. |
| `children` | The list of the entries below (`role="list"`). |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-tree-indent` | `--el-space-4` | How far the entries below stand in from this one. Set on the tree, or for the page. Without a theme it is `1rem`. |

Reads the design tokens of the library: `--el-space-1` and `--el-space-2` for the room in a row, `--el-color-fg` and `--el-color-fg-muted` for the name and the count, `--el-color-accent` for the bar of the current entry, `--el-radius-md` for the corners of a row, `--el-focus-ring-*` for the focus ring.

## The row

A row is as wide as the tree on every level: the fill of the row under the pointer, and of the current entry, reaches from edge to edge, and what stands in the row is moved in by the level. Every row has the place of the button of a branch, with or without entries below, so the names of a level begin on one line.

A name that is longer than the tree breaks into more lines, inside of a word where it has to.

## A link, a branch, a name

- **With `href`** the name is a native link, and its target is the whole row: the start, the name, the end and the room around them. An entry that also has entries below it gets a button in front of the name, which opens and closes them. The button lies on top of the link and is a target of its own.
- **Without `href`, with entries below**, the entry is a button as a whole: a click anywhere on its row opens and closes it. That is a category that leads nowhere itself.
- **Without `href` and without entries below**, the entry is a text.

## Opening and closing

`open="true"` shows the entries below. The stylesheet of the entry reads that attribute, so a server-rendered entry is open or closed from the first paint. The button of a branch, the arrow keys of the tree and `toggle()` change it and fire `tree-item-toggle`; setting `open` from a script changes it and fires nothing.

An entry without entries below it has no button and no state: `open` does nothing there. When entries come later, the button comes with them.

## The current entry

`current` marks the entry of the page the user is on. With `href` its link gets `aria-current="page"`, without it the name gets `aria-current="true"`.

It is told apart by a tint of the text colour, by a bar at its start in the accent colour and by a heavier name. The bar and the weight do not depend on a colour: where the user forces colours, the bar is drawn in a colour of the system.

The tree does not open the branches above the current entry. Render them open.

## Accessibility

- The entry has `role="listitem"`, and the entries below it are in a list of their own (`role="list"`).
- The button of a branch is named by the name of its entry (`aria-labelledby`), says whether the branch is open (`aria-expanded`) and which list it opens (`aria-controls`).
- An icon in `start` that only repeats the name should be hidden from assistive technology (`aria-hidden="true"`).
- For the keyboard, see [`el-tree`](../tree/tree.readme.md#keyboard).
- On a touch screen (`@media (any-pointer: coarse)`) a row that is a target is at least `--el-touch-target` high, and the button of a branch is that wide and high.

## Server-side rendering

The entry, its link, its button and the list below it are part of the server-rendered markup (Declarative Shadow DOM). Whether the entry has entries below it is asked of its children, which a server knows as well. Its links work before the script has run; opening and closing needs the script.

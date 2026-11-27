# Menu Item

`menu-item` is one entry of an [`el-menu`](../menu/menu.readme.md): an action, or a link with an address.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/menu/define';
import '@webtides/element-library/menu-item/define';
```

```html
<el-menu>
    <el-button slot="trigger">More</el-button>
    <el-menu-item value="edit"><svg slot="icon" aria-hidden="true">…</svg>Edit</el-menu-item>
    <el-menu-item href="/invoices/12/print">Print</el-menu-item>
    <el-menu-item value="move" disabled="true">Move</el-menu-item>
    <el-menu-item value="delete" variant="danger">Delete</el-menu-item>
</el-menu>
```

> Boolean attributes are passed as strings (`disabled="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | `''` | The address the entry leads to. With one it is a link. |
| `target` | `string` | `''` | Where to open the address. |
| `rel` | `string` | `'noreferrer noopener'` | `rel` attribute for the link, written when `target` is set. |
| `value` | `string` | `''` | What the entry stands for, for the listener of `menu-select`. |
| `disabled` | `boolean` | `false` | Whether the entry cannot be chosen. The keyboard still gets to it. |
| `variant` | `string` | `'neutral'` | `neutral`, `brand`, `success`, `warning` or `danger`: `danger` for something that cannot be undone. Reflected. |

#### Methods

| Name      | Description                                               |
| --------- | --------------------------------------------------------- |
| `focus()` | Puts the focus on the entry: on the control inside of it. |

#### Events

_None of its own._ A choice is a `click` on the entry, and `menu-select` on its menu.

#### Slots

| Name      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| (default) | The text of the entry.                                            |
| `icon`    | An icon in front of the text: a decoration, the text is the name. |

#### CSS Parts

| Name    | Description                                       |
| ------- | ------------------------------------------------- |
| `base`  | The entry: a `<button>`, or an `<a>` with `href`. |
| `icon`  | The place of the icon.                            |
| `label` | The text of the entry.                            |

#### CSS Custom Properties

Reads `--el-control-height` for its height (an entry is a little lower than a control), `--el-space-1`, `--el-space-2` and `--el-space-3` for its padding and the gap to its icon, `--el-radius-md`, `--el-focus-ring-width` and `--el-color-focus-ring` for the focus, `--el-touch-target` on a touch screen, and the colour of its variant: `--el-color-fg`, or `--el-color-danger` for `variant="danger"`.

## An action or a link

Without `href` the entry is a button, and choosing it is a click the page acts on. With `href` it is a link, which the browser follows. Both have the role of a menu item, and both close the menu.

## Disabled

`disabled="true"` takes the entry out of what can be chosen. It says so to assistive technology (`aria-disabled="true"`), fires no click, and a link has no address while it is disabled. The arrow keys still stop at it: a screen reader user learns that the action is there and not available now.

## A danger

`variant="danger"` shows the entry in the colour of a danger, for an action that cannot be undone. The colour alone does not say so to everyone: name the action for what it does ("Delete"), and ask before it is done where it matters.

## The icon

What is in the `icon` slot stands in front of the text. It is a decoration: give it `aria-hidden="true"`, the text is the name of the entry. Without an icon the text starts where the entry starts.

## Accessibility

- A menu item (`role="menuitem"`), which is no stop of the Tab key: its menu moves the focus to it.
- The focus of the keyboard shows as a ring inside of the entry and a tint, the pointer as a tint.
- On a touch screen the entry is at least `--el-touch-target` high. Without the token nothing changes.

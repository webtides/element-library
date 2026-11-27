# Menu Item

`menu-item` is one entry of an [`el-menu`](../menu/menu.readme.md): an action, or a link with an address. Or an entry that sets something: one that is on or off, or the chosen one of several.

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
| `type` | `string` | `'normal'` | `normal`, an action or a link; `checkbox`, an entry that is on or off; `radio`, one of several of which one is chosen. |
| `checked` | `boolean` | `false` | Whether an entry with the `type` `checkbox` is on, or one with the `type` `radio` is the chosen one. The page sets it. |
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

| Name | Description |
| --- | --- |
| `base` | The entry: a `<button>`, or an `<a>` with `href`. |
| `mark` | The place of the mark of an entry with a `type`: a check, or a dot. It is there while the entry is not checked as well. |
| `icon` | The place of the icon. |
| `label` | The text of the entry. |

#### CSS Custom Properties

Reads `--el-control-height` for its height (an entry is a little lower than a control), `--el-space-1`, `--el-space-2` and `--el-space-3` for its padding and the gap to its icon, `--el-radius-md`, `--el-focus-ring-width` and `--el-color-focus-ring` for the focus, `--el-touch-target` on a touch screen, and the colour of its variant: `--el-color-fg`, or `--el-color-danger` for `variant="danger"`.

## An action or a link

Without `href` the entry is a button, and choosing it is a click the page acts on. With `href` it is a link, which the browser follows. Both have the role of a menu item, and both close the menu.

## Disabled

`disabled="true"` takes the entry out of what can be chosen. It says so to assistive technology (`aria-disabled="true"`), fires no click, and a link has no address while it is disabled. The arrow keys still stop at it: a screen reader user learns that the action is there and not available now.

## An entry that is checked

An entry can set something instead of doing something: the view a list is shown in, whether the archived rows are in it. `type` says which kind it is, and `checked` its state.

```html
<el-menu>
    <el-button slot="trigger">View</el-button>
    <el-menu-group label="Layout">
        <el-menu-item type="radio" value="list" checked="true">List</el-menu-item>
        <el-menu-item type="radio" value="grid">Grid</el-menu-item>
    </el-menu-group>
    <el-menu-group>
        <el-menu-item type="checkbox" value="archived">Show archived</el-menu-item>
    </el-menu-group>
</el-menu>
```

- **`type="checkbox"`** is an entry that is on or off (`role="menuitemcheckbox"`). **`type="radio"`** is one of several of which one is chosen (`role="menuitemradio"`): put the ones that belong together into an [`el-menu-group`](../menu-group/menu-group.readme.md).
- **`checked`** is the state. The entry says it to assistive technology (`aria-checked`), also while it is off and while it is disabled.
- **The page sets the state.** The entry does not change `checked` when it is chosen: the menu can be the answer of a server, and the server says what is chosen. Set it in the listener of `menu-select`, for the entry and, among radios, for the others:

```js
menu.addEventListener('menu-select', ({ detail: { item } }) => {
    if (item.type === 'radio') {
        for (const other of item.parentElement.querySelectorAll('el-menu-item')) other.checked = other === item;
    } else if (item.type === 'checkbox') {
        item.checked = !item.checked;
    }
});
```

- **The mark** is in front of the text, and in front of the icon: a check for an entry that is on, a dot for the chosen one. Its place is there while the entry is not checked as well, so the text does not move when the state changes, and the texts of the entries of a group begin on one line. An entry without a `type` has no such place: in a menu that has both kinds, keep the checked ones in a group of their own.
- **Where the user forces colours** the mark has the colour of the text: the check is text, the dot is drawn with a border.
- **Choosing** such an entry is the same as for every entry: a click, `menu-select`, and the menu closes.

## A danger

`variant="danger"` shows the entry in the colour of a danger, for an action that cannot be undone. The colour alone does not say so to everyone: name the action for what it does ("Delete"), and ask before it is done where it matters.

## The icon

What is in the `icon` slot stands in front of the text. It is a decoration: give it `aria-hidden="true"`, the text is the name of the entry. Without an icon the text starts where the entry starts.

## Accessibility

- A menu item (`role="menuitem"`), which is no stop of the Tab key: its menu moves the focus to it. With a `type` it is a `menuitemcheckbox` or a `menuitemradio`, which says its state (`aria-checked`). The mark is hidden from assistive technology: the state is said, not drawn.
- The focus of the keyboard shows as a ring inside of the entry and a tint, the pointer as a tint.
- On a touch screen the entry is at least `--el-touch-target` high. Without the token nothing changes.

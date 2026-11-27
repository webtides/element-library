# Menu

`menu` is a menu button: a button that opens a list of actions. "Edit, Duplicate, Delete" for a row of a table, the account in a header, "More" at the end of a toolbar. The button is what the page puts into the `trigger` slot, and the actions are [`el-menu-item`](../menu-item/menu-item.readme.md) elements.

A screen reader announces it as a menu, the keyboard moves through its entries, and its panel floats: it is in the top layer of the browser, so nothing clips it and it moves nothing on the page.

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
    <el-button slot="trigger" caret="true">More</el-button>
    <el-menu-item value="edit">Edit</el-menu-item>
    <el-menu-item value="duplicate">Duplicate</el-menu-item>
    <el-menu-item value="delete" variant="danger">Delete</el-menu-item>
</el-menu>
```

```js
document.querySelector('el-menu').addEventListener('menu-select', (event) => {
    console.log(event.detail.value); // 'edit'
});
```

> Boolean attributes are passed as strings (`open="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether the menu is shown. Reflected to the `open` attribute. |
| `label` | `string` | `''` | The name of the menu for assistive technology. Without one the menu has the name of its button. |
| `placement` | `string` | `'bottom-start'` | The side of the button the menu is placed at: `top`, `bottom`, `left` or `right`, each also with `-start` or `-end`. |
| `distance` | `number` | `4` | The gap between the button and the menu, in pixels. |

#### Methods

| Name       | Description                                                |
| ---------- | ---------------------------------------------------------- |
| `show()`   | Opens the menu, with the focus on its first entry.         |
| `hide()`   | Closes the menu.                                           |
| `toggle()` | Opens the menu when it is closed, and closes it when open. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `menu-select` | `{ item: HTMLElement, value: string }` | Fired when the user has chosen an entry: the `el-menu-item`, and its `value`. The menu closes after it. |
| `menu-show` |  | Fired when the menu has opened. |
| `menu-hide` |  | Fired when the menu has closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The entries: `el-menu-item` elements, in `el-menu-group` elements where they are divided into groups. An `el-divider` is a line between two of them. |
| `trigger` | The button that opens the menu. |

#### CSS Parts

| Name      | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| `trigger` | Forwarded onto the `trigger` slot.                                                   |
| `panel`   | The floating panel, which is the menu: background, border, radius, elevation, width. |

#### CSS States

| Name   | Description                                                    |
| ------ | -------------------------------------------------------------- |
| `open` | Set while the menu is shown. Style with `el-menu:state(open)`. |

#### CSS Custom Properties

| Name                  | Default | Description                     |
| --------------------- | ------- | ------------------------------- |
| `--el-menu-min-width` | `10rem` | The least width of the menu.    |
| `--el-menu-max-width` | `20rem` | The greatest width of the menu. |

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text (the colours of the system without a theme: a floating surface has to be readable over the page), `--el-color-border` and `--el-border-width` for its border, `--el-radius-lg`, `--el-shadow-lg`, `--el-space-1` for its padding and `--el-font-size-sm` for its text.

## The button

Any button goes into the `trigger` slot: an `el-button`, or a native `<button>`. The menu writes two attributes onto it, which say to assistive technology what it does:

- `aria-haspopup="menu"`: it opens a menu.
- `aria-expanded`: whether the menu is open.

An `el-button` passes both on to the control inside of it. A button that shows an icon alone needs a name (`aria-label`), which is the name of the menu as well:

```html
<el-menu>
    <el-button slot="trigger" circle="true" aria-label="Actions for the invoice">
        <svg aria-hidden="true">…</svg>
    </el-button>
    …
</el-menu>
```

## Keyboard

| Key              | On the button                            | In the menu                                      |
| ---------------- | ---------------------------------------- | ------------------------------------------------ |
| `Enter`, `Space` | Opens the menu, focus on the first entry | Chooses the entry                                |
| `ArrowDown`      | Opens the menu, focus on the first entry | The next entry, from the last one to the first   |
| `ArrowUp`        | Opens the menu, focus on the last entry  | The entry before, from the first one to the last |
| `Home`, `End`    |                                          | The first entry, the last entry                  |
| A letter         |                                          | The next entry that starts with it               |
| `Escape`         |                                          | Closes the menu, focus back on the button        |
| `Tab`            | Moves on                                 | Closes the menu, and the focus moves on          |

The entries are no stops of the Tab key: the menu is one, through its button, and moves the focus itself. An entry that is disabled is reached by the arrow keys, so a screen reader finds it, and cannot be chosen.

## Choosing an entry

Choosing is a click on an entry, with the pointer, `Enter` or `Space`. The menu fires `menu-select` and closes, and the focus is on the button again.

- `detail.item` is the `el-menu-item`, `detail.value` its `value`.
- The click is a click on the entry as well, for a listener there.
- An entry with `href` is a link: the browser follows it, and the menu closes.
- A click beside the menu closes it and chooses nothing.

## Groups

Entries that belong together go into an [`el-menu-group`](../menu-group/menu-group.readme.md), which has a line over it and a heading where it has a `label`. An [`el-divider`](../divider/divider.readme.md) is a line alone.

```html
<el-menu>
    <el-button slot="trigger">File</el-button>
    <el-menu-item value="open">Open</el-menu-item>
    <el-menu-group label="Share">
        <el-menu-item value="mail">Mail</el-menu-item>
        <el-menu-item value="link">Copy link</el-menu-item>
    </el-menu-group>
    <el-menu-group>
        <el-menu-item value="delete" variant="danger">Delete</el-menu-item>
    </el-menu-group>
</el-menu>
```

## The panel

- **In the top layer.** The panel is a native popover: an element around the menu that clips (`overflow: hidden`) does not cut it off, and no `z-index` is needed. It takes no room on the page.
- **At its button.** `placement` names the side, `bottom-start` by default: below the button and in line with the start of it, which is the right edge in a right-to-left page. Without room at that side the menu goes to the opposite one, and it is pushed back along the edge of the viewport where it would leave it. It follows the button when the page scrolls.
- **As wide as its entries**, between `--el-menu-min-width` and `--el-menu-max-width`. A text that is longer wraps.
- **A long menu scrolls** in what the browser shows.
- **One at a time.** A menu that opens closes another one that is open, as every native popover does.

Its place comes from [Floating UI](https://floating-ui.com), which the element imports (`@floating-ui/dom`).

## Not in this element

- A menu in a menu (a submenu).
- Entries that are checked (`menuitemcheckbox`, `menuitemradio`).
- A menu bar.

For a panel in the flow of the page there is [`el-dropdown`](../dropdown/dropdown.readme.md), and for a floating panel with any content [`el-popover`](../popover/popover.readme.md).

## Server-side rendering

The menu and its entries render on a server with `@webtides/element-js-ssr-renderer`. Before the script has run the menu is its button: the panel is a popover that is closed, and takes no room. The roles of the menu and of its entries, the links and the entries that are disabled are in the markup. The script adds what the button says (`aria-haspopup`, `aria-expanded`), the opening and the keyboard. A button does nothing before that.

## Accessibility

- The panel has `role="menu"`, with the name of `label` or the one of its button. The entries have `role="menuitem"`, the groups `role="group"` with their heading as their name.
- The button says that it opens a menu and whether the menu is open.
- The focus is on an entry while the menu is open, and goes back to the button when the menu closes after a choice or `Escape`.
- The entry that has the focus of the keyboard has a ring inside of it, which shows where the user forces colours.
- On a touch screen every entry is at least `--el-touch-target` high.
- Without a theme the menu has the colours of the system, and reads in a light and in a dark scheme.

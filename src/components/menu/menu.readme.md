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

| Name | Description |
| --- | --- |
| `show()` | Opens the menu, with the focus on its first entry. |
| `hide()` | Closes the menu. |
| `toggle()` | Opens the menu when it is closed, and closes it when open. |
| `showAt(place, opener?)` | Opens the menu somewhere else than at its own button: at an element of the page, or at a point `{ x, y }` of the viewport. `opener` is what it is opened for. Called with the click of a press on the element the menu is open at, it closes the menu. |

#### Read-only properties

| Name | Type | Description |
| --- | --- | --- |
| `opener` | `Element \| undefined` | What the menu is open for: the row or the button of `showAt()`, or its own button. Nothing while it is closed. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `menu-select` | `{ item: HTMLElement, value: string, opener: Element }` | Fired when the user has chosen an entry: the `el-menu-item`, its `value`, and what the menu was opened for. The menu closes after it. |
| `menu-show` |  | Fired when the menu has opened. |
| `menu-hide` |  | Fired when the menu has closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The entries: `el-menu-item` elements, in `el-menu-group` elements where they are divided into groups. An `el-divider` is a line between two of them. |
| `trigger` | The button that opens the menu. A menu that is opened with `showAt()` alone needs none. |

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

#### While the focus is not on an entry

An open menu keeps the keyboard wherever the focus is: after a press beside the entries, on a row whose finger has just been lifted, before the entries are there. It hears the keys at the window for as long as it is open, before the page does.

- **`Escape` closes the menu from anywhere**, and the focus goes back to its button, or to what the menu was opened for. The key does not reach the page behind: a dialog around the menu stays open. Only a listener in the capture phase of the window that was there before the menu opened hears it first.
- **`ArrowDown` and `ArrowUp` bring the focus into the menu** from anywhere in the page, to its first and to its last entry.
- **The Tab key closes the menu from anywhere**, and the focus moves on from where it is.
- **Every other key is the one of the page** while the focus is not in the menu. A page with shortcuts of single letters asks itself whether a menu is open (`menu.open`).
- **A press beside the entries**, on the heading of a group, on a line or on the padding of the panel, leaves the focus on the entry that had it, and the arrow keys go on from there. Where no entry had it, the panel takes the focus of the press itself: it has `tabindex="-1"`, and is no stop of the Tab key.

## Choosing an entry

Choosing is a click on an entry, with the pointer, `Enter` or `Space`. The menu fires `menu-select` and closes, and the focus is on the button again.

- `detail.item` is the `el-menu-item`, `detail.value` its `value`.
- The click is a click on the entry as well, for a listener there.
- An entry with `href` is a link: the browser follows it, and the menu closes.
- A click beside the menu closes it and chooses nothing.

## Groups

Entries that belong together go into an [`el-menu-group`](../menu-group/menu-group.readme.md), which has a line over it and a heading where it has a `label`. An [`el-divider`](../divider/divider.readme.md) is a line alone, with `--el-space-1` above and below it. That room is the menu's, not a margin of the element: a reset of the page that takes the margin off every element changes nothing.

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

## Entries that are checked

An [`el-menu-item`](../menu-item/menu-item.readme.md) with `type="checkbox"` is on or off, one with `type="radio"` is the chosen one of several, and `checked` is the state. The entry says the state and shows it with a mark in front of its text.

```html
<el-menu-group label="Layout">
    <el-menu-item type="radio" value="list" checked="true">List</el-menu-item>
    <el-menu-item type="radio" value="grid">Grid</el-menu-item>
</el-menu-group>
```

Choosing such an entry is a choice as every other: `menu-select`, and the menu closes. The menu changes no state: the page sets `checked` in its listener, or renders the menu again with the answer of a server.

## The panel

- **In the top layer.** The panel is a native popover: an element around the menu that clips (`overflow: hidden`) does not cut it off, and no `z-index` is needed. It takes no room on the page.
- **At its button.** `placement` names the side, `bottom-start` by default: below the button and in line with the start of it, which is the right edge in a right-to-left page. Without room at that side the menu goes to the opposite one, and it is pushed back along the edge of the viewport where it would leave it. It follows the button when the page scrolls.
- **As wide as its entries**, between `--el-menu-min-width` and `--el-menu-max-width`. A text that is longer wraps.
- **A long menu scrolls** in what the browser shows.
- **One at a time.** A menu that opens closes another one that is open.
- **A press beside it closes it**, when the pointer goes down. Its own button, and the element it was opened at with `showAt()`, are not beside it: they close it with their click. The panel is a popover the menu opens and closes itself (`popover="manual"`): one the platform closes would be gone when the finger of a long press is lifted.

Its place comes from [Floating UI](https://floating-ui.com), which the element imports (`@floating-ui/dom`).

## One menu for many rows

A dense list has the same actions for every row: mark as read, rename, move, delete. One `el-menu` serves all of them. It has no button of its own, and the page opens it where it is needed with `showAt()`:

```html
<ul id="notes">
    <li data-id="12" tabindex="0">
        Release notes
        <el-button circle="true" appearance="plain" aria-haspopup="menu" aria-label="Actions for Release notes">
            <svg aria-hidden="true">…</svg>
        </el-button>
    </li>
    …
</ul>

<el-menu id="actions" label="Actions">
    <el-menu-item value="read">Mark as read</el-menu-item>
    <el-menu-item value="rename">Rename</el-menu-item>
    <el-menu-item value="delete" variant="danger">Delete</el-menu-item>
</el-menu>
```

```js
const list = document.querySelector('#notes');
const menu = document.querySelector('#actions');

// A right click on a row: the menu opens where the pointer is.
list.addEventListener('contextmenu', (event) => {
    const row = event.target.closest('li');
    if (!row) return;
    event.preventDefault();
    menu.showAt({ x: event.clientX, y: event.clientY }, row);
});

// The button of a row: the same menu, at the button.
list.addEventListener('click', (event) => {
    const button = event.target.closest('[aria-haspopup="menu"]');
    if (button) menu.showAt(button);
});

menu.addEventListener('menu-select', (event) => {
    const row = event.detail.opener.closest('li');
    act(event.detail.value, row.dataset.id);
});
```

- **`showAt({ x, y }, opener)`** opens the menu at a point of the viewport, the `clientX` and `clientY` of an event. The corner of the menu is at the point, as the menu of the system is, and the menu stays inside of the viewport.
- **`showAt(element)`** opens it at an element, placed as at its own button (`placement`, `distance`). It follows the element when the page scrolls.
- **A menu at a point closes when what it was opened for scrolls away under it**: the page, or a region around the row, the list in a column of an `el-app-frame`. A point does not move with the row, and the menu would be left over another one. The focus goes back to the row without scrolling to it, so the scroll goes on. A scroll inside of a long menu leaves it open, and so does one of a region that does not move the row. A menu that was opened for nothing (`showAt({ x, y })` alone) closes for every scroll of the page beside it.
- **The opener** is what the menu is opened for: the second argument, or the element it is placed at. It is `menu.opener` while the menu is open and `detail.opener` of `menu-select`, and it gets the focus back when the menu closes after a choice or `Escape`. A row that should get the focus back has to be able to take it (`tabindex`).
- **A second press on the button of a row closes the menu**, with the listener above and nothing more. While the pointer is down on the element the menu is open at, the menu stays open, and the `showAt()` the page calls with the click of that press closes it. The button says `aria-expanded="false"` after. A call of `showAt()` with no press before it, from a script or for `Enter` on the button, opens the menu.
- **An open menu moves** when `showAt()` is called again, for a right click on another row. It tells of both: `menu-hide` for the row it has left, `menu-show` for the one it is open for.
- **The roles and the keys** are the ones of the menu: the focus is on the first entry, the arrow keys move through the entries, `Escape` closes.
- **Nothing in the menu of the right click alone.** A right click and a long press are found by a user who knows them. The button of the row offers the same entries to everybody else, and to the keyboard.
- **The button of a row** says that it opens a menu: write `aria-haspopup="menu"` onto it. The menu tells such a button whether it is open for it (`aria-expanded`), and takes its name while it has no `label` of its own. A row is no control, and nothing is written onto it.
- **A menu with a button of its own** can be opened with `showAt()` as well. Its button does not say that the menu is open while it is open elsewhere.

#### A long press

A browser on Android fires `contextmenu` for a long press, and the listener above is all it takes. Safari on iOS does not: there the page finds the long press itself, a finger that stays down for half a second without moving, and calls `showAt()` while the finger is still down. The menu stays open when the finger is lifted.

```js
let timer;
list.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    const row = event.target.closest('li');
    timer = setTimeout(() => menu.showAt({ x: event.clientX, y: event.clientY }, row), 500);
});
for (const type of ['pointerup', 'pointercancel', 'pointermove']) {
    list.addEventListener(type, () => clearTimeout(timer));
}
```

A long press on a text selects it in Safari, and the selection takes the finger away from the page. Keep the text of a row from being selected for that:

```css
#notes li {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}
```

## Entries that come later

The page can render the entries when the menu is asked for, as the answer of a server, and an autoloader can define `el-menu-item` when it first sees one. The menu is open then before an entry can take the focus, and the focus stays where it was.

```js
menu.addEventListener('menu-show', async () => {
    const actions = await load(menu.opener);
    menu.replaceChildren(...actions.map(entry));
});
```

- **The focus goes to the first entry once the entries are there**: when they have come into the menu, and when their element is defined. To the last one where `ArrowUp` has opened the menu. Not where the user has put the focus into the menu by then.
- **The menu is placed again**: it has another size with its entries, and stays inside of the viewport.
- **Until then the keys work as above**: `Escape` closes the menu.

## Not in this element

- A menu in a menu (a submenu).
- A menu that stays open after a choice.
- A menu bar.

For a panel in the flow of the page there is [`el-dropdown`](../dropdown/dropdown.readme.md), and for a floating panel with any content [`el-popover`](../popover/popover.readme.md).

## Server-side rendering

The menu and its entries render on a server with `@webtides/element-js-ssr-renderer`. Before the script has run the menu is its button: the panel is a popover that is closed, and takes no room. A menu without a button, for the rows of a list, takes no room at all. The roles of the menu and of its entries, the links and the entries that are disabled are in the markup. The script adds what the button says (`aria-haspopup`, `aria-expanded`), the opening and the keyboard. A button does nothing before that.

## Accessibility

- The panel has `role="menu"`, with the name of `label` or the one of its button. The entries have `role="menuitem"`, or `menuitemcheckbox` and `menuitemradio` with their state (`aria-checked`), the groups `role="group"` with their heading as their name.
- The button says that it opens a menu and whether the menu is open.
- The focus is on an entry while the menu is open, and goes back to the button, or to what the menu was opened for, when the menu closes after a choice or `Escape`.
- The keys of the menu work wherever the focus is while the menu is open: `Escape` closes it, the arrow keys bring the focus into it.
- The entry that has the focus of the keyboard has a ring inside of it, which shows where the user forces colours.
- On a touch screen every entry is at least `--el-touch-target` high.
- Without a theme the menu has the colours of the system, and reads in a light and in a dark scheme.

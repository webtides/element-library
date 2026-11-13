# Pagination

`pagination` is the way through a list that is split into pages. It shows the current page, the pages around it, the first and the last, and a button for the page before and the page after. The pages in between are left out, and the row keeps its length while the current page moves.

It loads nothing itself: a button sets `page` and fires `pagination-change`, and the page shows the entries that belong to it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/pagination/define';
```

```html
<!-- 200 entries, 10 on a page: 20 pages -->
<el-pagination total="200"></el-pagination>

<!-- 25 on a page, on the third page -->
<el-pagination total="200" per-page="25" page="3"></el-pagination>
```

```js
const pagination = document.querySelector('el-pagination');

pagination.addEventListener('pagination-change', (event) => {
    showEntriesOf(event.detail.page);
});
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | `number` | `1` | The current page, counted from 1. Reflected. |
| `total` | `number` | `0` | The number of entries in the whole list. |
| `per-page` | `number` | `10` | The number of entries on one page. |
| `siblings` | `number` | `1` | How many pages are shown on each side of the current page. |
| `boundaries` | `number` | `1` | How many pages are shown at the start and at the end of the row. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`: the size of the buttons. Reflected. |
| `label` | `string` | `'Pagination'` | The name of the landmark. |
| `page-label` | `string` | `'Page'` | The word the button of a page is named with, in front of its number: "Page 3". |
| `previous-label` | `string` | `'Previous page'` | The name of the button for the page before. |
| `next-label` | `string` | `'Next page'` | The name of the button for the page after. |
| `pages` | `number` |  | The number of pages. Read-only, a property without an attribute. |

#### Methods

_None._

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `pagination-change` | `{ page: number }` | Fired when a button has changed the page. Not fired when `page` is set from a script. |

#### Slots

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `previous-icon` | The icon of the button for the page before. Unset, an arrow head. |
| `next-icon`     | The icon of the button for the page after. Unset, an arrow head.  |

#### CSS Parts

| Name       | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `base`     | The `nav` landmark.                                          |
| `list`     | The row of the buttons.                                      |
| `button`   | Every button: the pages, the page before and the page after. |
| `page`     | The button of a page.                                        |
| `current`  | The button of the current page.                              |
| `previous` | The button for the page before.                              |
| `next`     | The button for the page after.                               |
| `ellipsis` | The mark in the place of pages that are left out.            |

#### CSS Custom Properties

_None._

Reads the standard library design tokens: `--el-color-fg`, `--el-color-fg-muted`, `--el-color-bg`, `--el-color-accent`, `--el-color-focus-ring`, `--el-focus-ring-width`, `--el-focus-ring-offset`, `--el-control-height`, `--el-touch-target`, `--el-space-1`, `--el-radius-md`, `--el-font-family`, `--el-font-size-sm`, `--el-font-size-md`, `--el-duration-md` and `--el-ease`.

## The pages

The number of pages is `total` divided by `per-page`, rounded up; the read-only property `pages` holds it. A list without entries has one page, an empty one.

`page` is the current page. A page that does not exist is shown as the nearest one that does: `page="99"` of 20 pages shows the last page, and a list that gets shorter keeps to the pages that are left. The property itself is not changed for that.

A value that is no number counts as the default.

## The row

The row has a fixed number of places:

- `boundaries` pages at the start and as many at the end,
- the current page with `siblings` pages on each side,
- one place between each end and the middle. It holds an ellipsis, or the page itself where only one page is missing.

With the defaults that is seven places: `1 … 9 10 11 … 20`. Near an end the middle does not shrink but stops, so the row is as long on the first page as on any other: `1 2 3 4 5 … 20`. A list with no more pages than places shows them all.

| `siblings` | `boundaries` | On page 10 of 20        |
| ---------- | ------------ | ----------------------- |
| `0`        | `1`          | `1 … 10 … 20`           |
| `1`        | `1`          | `1 … 9 10 11 … 20`      |
| `2`        | `1`          | `1 … 8 9 10 11 12 … 20` |
| `1`        | `2`          | `1 2 … 9 10 11 … 19 20` |
| `1`        | `0`          | `… 9 10 11 …`           |

Where the row does not fit into its container it breaks into a second row. With the defaults the row is nine buttons wide, 24.5rem at the medium size. `siblings="0"` takes two of them away and `boundaries="0"` two more, and `size="small"` makes every button a fifth narrower: on a phone a row of five small buttons (`siblings="0" boundaries="0" size="small"`) is 11rem wide.

## The event

`pagination-change` is fired when a button has changed the page, with the new page in `event.detail.page`. At that moment `page` is set already. The event bubbles and crosses shadow roots.

A click on the current page does nothing. `page` set from a script changes the row without an event.

The pagination renders buttons, not links: it does not change the address of the page. Write the page into the address in the listener where a page should be reachable by a link.

## Size and look

| `size`   | With a control height of 2.5rem |
| -------- | ------------------------------- |
| `small`  | Buttons of 2rem                 |
| `medium` | Buttons of 2.5rem               |
| `large`  | Buttons of 3.125rem             |

A button is a square of the control height of its size, and grows in width with a number that does not fit. On a touch screen no button is smaller than `--el-touch-target`.

The buttons are text on nothing, with a tint of the text colour under the pointer. The current page has the fill of the accent colour (`--el-color-accent`) with the colour of the page background on it, like a brand button. Without a theme the buttons have the text colour of the page, and the current page a blue fill.

There is no `variant`. For another look paint the parts:

```css
el-pagination::part(current) {
    background: none;
    color: inherit;
    box-shadow: inset 0 -2px currentColor;
}
```

Both `page` and `size` are reflected: the element writes them onto itself as attributes, the defaults included.

## Accessibility

- The pagination is a navigation landmark (`nav`) with the name in `label`. Two paginations on one page need two names, "Pages of the results" and "Pages of the comments" for example.
- The row is a list of buttons. Every button has a name: "Page 3", "Previous page", "Next page". The button of the current page is marked with `aria-current="page"`.
- The names are English by default. For another language set `label`, `page-label`, `previous-label` and `next-label`.
- The ellipsis and the arrow heads are hidden from assistive technology.
- All buttons are reached with `Tab` and pressed with `Enter` or `Space`. The button for the page before is disabled on the first page, the one for the page after on the last.
- After a button of a page is pressed, the focus is on the button of that page, wherever it stands in the new row. It stays on an arrow button, which can be pressed again, until that one reaches the end; then it goes to the current page.
- The pagination does not announce the new page. What changes is the list: move the focus to its heading or announce it there.
- With forced colours the current page has the colours of a selection.
- The arrow heads turn with the reading direction (`dir="rtl"`).

## Server-side rendering

The pagination is fully part of the server-rendered markup (Declarative Shadow DOM): the row for the `page`, `total` and `per-page` of the element, the current page and the disabled buttons. Without JavaScript the buttons do nothing.

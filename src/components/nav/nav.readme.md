# Nav

`nav` holds the destinations of an application: the places the user goes to all the time. Each destination is an [`el-nav-item`](../nav-item/nav-item.readme.md), a link with an icon and a short text, and the one of the current view is marked.

It has three layouts. A **bar** for the lower edge of a phone, in reach of the thumb. A **rail** for the side of a wider screen: a narrow column of icons. A **list** for a sidebar: an icon and its text in one row. In the frame of an application the page writes the destinations once, and they are a bar or a column by the width.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/nav/define';
import '@webtides/element-library/nav-item/define';
```

```html
<el-nav label="Main">
    <el-nav-item href="/inbox" current="true"><svg slot="icon" aria-hidden="true">…</svg>Inbox</el-nav-item>
    <el-nav-item href="/today"><svg slot="icon" aria-hidden="true">…</svg>Today</el-nav-item>
    <el-nav-item href="/done"><svg slot="icon" aria-hidden="true">…</svg>Done</el-nav-item>
</el-nav>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `''` | The name of the navigation for assistive technology. A page with more than one navigation needs it to tell them apart. |
| `layout` | `'auto' \| 'bar' \| 'rail' \| 'list'` | `'auto'` | How the destinations lie: `bar`, a row in equal parts; `rail`, a narrow column; `list`, rows of an icon and its text; `auto`, a bar, and in the column at the side of an `el-app-frame` what `column` names. |
| `column` | `'rail' \| 'list'` | `'rail'` | What the destinations are in the column at the side of an `el-app-frame`, with `layout="auto"`. |
| `secondary-label` | `string` | `''` | The heading of the second group, and its name for assistive technology. |
| `labels` | `boolean` | `true` | Whether the destinations show their texts. With `false` they show an icon alone, and their texts as tooltips. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name | Description |
| --- | --- |
| (default) | The destinations: `el-nav-item` elements. |
| `secondary` | A second group of destinations, below the first: the pages that have no room in a bar. Not shown in a bar. |
| `end` | The destinations at the lower end of a rail or a list: the settings, the account. Not shown in a bar. |

#### CSS Parts

| Name | Description |
| --- | --- |
| `base` | The navigation landmark (`<nav>`): the surface and its line to the content. |
| `groups` | The two groups at the top, which scroll where a rail or a list has more destinations than height. |
| `list` | The list of the destinations. |
| `secondary` | The second group: its heading and its list. |
| `secondary-label` | The heading of the second group, which a list shows. |
| `secondary-list` | The list of the destinations of the second group. |
| `end` | The list of the destinations at the lower end of a rail or a list. |
| `tooltip` | The tooltip of a destination that shows an icon alone: an `el-tooltip`. |

#### CSS Custom Properties

| Name                 | Default | Description                                                      |
| -------------------- | ------- | ---------------------------------------------------------------- |
| `--el-nav-rail-size` | `5rem`  | The width of a rail.                                             |
| `--el-nav-list-size` | `16rem` | The width of a list where its place is as wide as what is in it. |

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text, and `--el-color-border` and `--el-border-width` for the line to the content. A list reads `--el-space-1` and `--el-space-2` for the room between and around its rows, and `--el-color-fg-muted`, `--el-font-size-xs` and `--el-space-3` for the heading of its second group. The destinations read the tokens named in the readme of [`el-nav-item`](../nav-item/nav-item.readme.md).

## The bar

`layout="bar"`, and what the element is where nothing says otherwise.

- **Three to five destinations.** They share the width in equal parts, however long their texts are. More than five do not fit a phone: the fifth is "More" then, and leads to a view with the rest.
- **A short text.** One word as a rule. A text that does not fit is cut with an ellipsis: it does not wrap, and the bar keeps its height.
- The `secondary` and the `end` slot are not shown: a bar has no room for another group.

## The rail

`layout="rail"`: the destinations below each other, in a column of `--el-nav-rail-size`.

```html
<el-nav label="Main" layout="rail">
    <el-nav-item href="/inbox" current="true"><svg slot="icon" aria-hidden="true">…</svg>Inbox</el-nav-item>
    <el-nav-item href="/today"><svg slot="icon" aria-hidden="true">…</svg>Today</el-nav-item>
    <el-nav-item slot="end" href="/settings"><svg slot="icon" aria-hidden="true">…</svg>Settings</el-nav-item>
</el-nav>
```

- **Two groups.** The destinations at the top, and the ones in the `end` slot at the lower end: the settings, the account. Each group is a list to assistive technology. A third one, below the first, is the `secondary` slot: see below.
- **As high as its place.** Give the rail a place with a height: the column of an `el-app-frame`, or an element the page sizes. With more destinations than the height takes, the group at the top scrolls, and the one at the lower end stays in view.
- **A line to the content** at the side that faces it, which follows the reading direction.

## The list

`layout="list"`: the destinations below each other, each a row with its icon and its text beside it. What a sidebar is.

```html
<el-nav label="Main" layout="list" secondary-label="More">
    <el-nav-item href="/inbox" current="true"><svg slot="icon" aria-hidden="true">…</svg>Inbox</el-nav-item>
    <el-nav-item href="/today"><svg slot="icon" aria-hidden="true">…</svg>Today</el-nav-item>
    <el-nav-item slot="secondary" href="/news"><svg slot="icon" aria-hidden="true">…</svg>What's new</el-nav-item>
    <el-nav-item slot="end" href="/settings"><svg slot="icon" aria-hidden="true">…</svg>Settings</el-nav-item>
</el-nav>
```

- **As wide as its place.** In a column of 20rem the rows are 20rem wide, in one of 12rem they are 12rem, and a text that does not fit is cut. Where the place is as wide as what is in it, the list is `--el-nav-list-size` wide (`16rem`): the column of an `el-app-frame` with `narrow-navigation="bar"` is such a place.
- **As high as its place**, as a rail is. The groups at the top scroll where they have more destinations than height, and the one in the `end` slot stays in view.
- **A row is as high as a control** (`--el-control-height`), and at least `--el-touch-target` on a touch screen.
- **The current destination** has a surface behind its whole row and a heavier text. A count in its `badge` slot is at the end of the row.
- **A line to the content** at the side that faces it, as a rail has.

## A second group

The destinations in the `secondary` slot are a group of their own below the first: the pages that have no room among the five of a phone. `secondary-label` is its heading.

- **A list** shows the heading over the group.
- **A rail** shows the group below a line. The heading does not show, and is the name of the group for assistive technology.
- **A bar** leaves the group out. A phone needs another way to those pages: a "More" destination, or a menu.

The group is a list to assistive technology, with `secondary-label` as its name. The heading the eye sees is not read a second time.

## An icon alone

`labels="false"` leaves the texts off the screen. A destination keeps its text as the name of its link, so write it as before, and shows it as a tooltip for the pointer and for the focus of the keyboard: beside a rail, above a bar.

```html
<el-nav label="Main" layout="rail" labels="false">…</el-nav>
```

The tooltips come with the script. They are `el-tooltip` elements in the shadow root of the element (`::part(tooltip)`), so nothing is added to what the page wrote. The element imports the tooltip, and with it `@floating-ui/dom`. A screen reader has the name already and does not read it twice.

## The links

- A destination is a link with an address. The Tab key stops at every one of them: this is a navigation, not a menu, and the arrow keys do nothing.
- **The current one** has `current="true"`. The page sets it: the element does not know the address of the view.

## In the frame of an application

Written once, in the `navigation` slot of an [`el-app-frame`](../app-frame/app-frame.readme.md) with `narrow-navigation="bar"`:

```html
<el-app-frame narrow-navigation="bar">
    <main id="main">…</main>
    <el-nav slot="navigation" label="Main">
        <el-nav-item href="/inbox" current="true"><svg slot="icon" aria-hidden="true">…</svg>Inbox</el-nav-item>
        <el-nav-item href="/today"><svg slot="icon" aria-hidden="true">…</svg>Today</el-nav-item>
        <el-nav-item slot="end" href="/settings"><svg slot="icon" aria-hidden="true">…</svg>Settings</el-nav-item>
    </el-nav>
</el-app-frame>
```

- Where the frame is narrow, its navigation lies at the lower edge, and the destinations are a bar.
- Where the frame is wide, its navigation is the column at the side, and the destinations are a rail, or a list with `column="list"`.

```html
<el-nav slot="navigation" label="Main" column="list" secondary-label="More">…</el-nav>
```

The stylesheets decide, by the width of the frame: the frame tells the element in a CSS property that is inherited, and nothing is written onto it. That holds before any script has run. `column` is an attribute a server writes, so an application can have a list on most of its views and a rail on the ones that need the width themselves, without a script.

A list fills a column that has a width: the `--el-app-frame-navigation-size` of the page, or the one the user has set by dragging the edge of the column.

In both places the surface reaches the edge of the screen and the destinations stay clear of the home indicator and the notch of a phone: the region says how far its surface reaches. The line to the content is the one of the region.

The element is a navigation landmark itself. It goes into the slot without a `nav` around it.

A bar alone, with something else in the column of the wide frame, goes into the `footer` slot instead, with `narrow-only="footer"` on the frame.

## With what is no destination

A sidebar has more than destinations: the name of the application above them, the account and a form that logs out below them. Those are no destinations, and they are not in the element. Write an element of your own into the `navigation` slot, with the `el-nav` in it:

```html
<el-app-frame narrow-navigation="bar">
    <div slot="navigation" class="side">
        <a class="side-only" href="/">Tasks</a>
        <el-nav label="Main" column="list">…</el-nav>
        <div class="side-only">
            ada@example.com
            <form method="post" action="/logout"><button>Log out</button></form>
        </div>
    </div>
    <main id="main">…</main>
</el-app-frame>
```

```css
.side {
    display: flex;
    flex-direction: column;
    block-size: 100%;
}

/* The frame is a container. Its step is 48rem here. */
@container (width < 48rem) {
    .side-only {
        display: none;
    }
}
```

- **The `el-nav` takes its layout from the frame** as one that is in the slot itself: the property of the frame is inherited.
- **In a column of your element** (a flex column with a height) it takes the height that is left between what is above and below it. Its destinations scroll, and its group at the lower end stays in view. Without that layout it is as high as its destinations, and the column of the frame scrolls as a whole.
- **Where the frame is narrow**, your element lies at the lower edge with the bar in it. What is no destination is yours to hide there. The frame is a container for the queries of the page (`container-type: inline-size`), so a query by its width needs no script: write the width of `wide-from` into it.

## Alone

Outside of a frame the element keeps its destinations clear of the edges of the screen itself (`env(safe-area-inset-*)`, with `viewport-fit=cover` in the viewport of the page): a bar of the home indicator and the sides, a rail of the top, its side and the lower edge. Its place is the business of the page:

```css
el-nav.bottom {
    position: fixed;
    inset: auto 0 0;
}
```

## The on-screen keyboard

A bar does nothing about it, and does not need to. A browser lays its keyboard over the page and leaves the layout as it is: the bar is under the keyboard, and takes no room from what the user types into. Safari on iOS moves the page up while the keyboard is open, to bring the field into view, and back when it closes.

A page that asks the browser to resize its content for the keyboard (`interactive-widget=resizes-content` in the viewport) has the bar above the keyboard instead.

In an [`el-app-frame`](../app-frame/app-frame.readme.md) the bar lies above the keyboard: the frame is as high as what shows above it, so its header stays in view.

## Server-side rendering

The element and its destinations render on a server with `@webtides/element-js-ssr-renderer`. Their look is their stylesheets: the layout, what the column of a frame makes of the destinations, the second group and its heading, the mark of the current destination, the texts that are off the screen and the room for the home indicator are there before the script has run, and nothing moves when the elements take over. The script adds the tooltips.

## Accessibility

- A navigation landmark (`<nav>`) with the name of `label`, and in it one list of links, and one more for each of the `secondary` and the `end` slot that has destinations. The list of the second group has the name of `secondary-label`.
- The current destination has `aria-current="page"`, and is told apart by more than its colour: see the readme of the destination.
- A destination that shows an icon alone has its text as its name.
- On a touch screen every destination is at least `--el-touch-target` wide and high, and so is a row of a list.
- Without a theme the element paints nothing and reads as the page does, in a light and in a dark scheme. The line to the content is a border: it stays where the user forces colours, and it is there without a theme then.

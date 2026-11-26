# Nav

`nav` holds the destinations of an application: the places the user goes to all the time. Each destination is an [`el-nav-item`](../nav-item/nav-item.readme.md), a link with an icon and a short text, and the one of the current view is marked.

It has two layouts. A **bar** for the lower edge of a phone, in reach of the thumb. A **rail** for the side of a wider screen: a narrow column of icons. In the frame of an application the page writes the destinations once, and they are the one or the other by the width.

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
| `layout` | `'auto' \| 'bar' \| 'rail'` | `'auto'` | How the destinations lie: `bar`, a row in equal parts; `rail`, a narrow column; `auto`, a bar, and a rail in the column at the side of an `el-app-frame`. |
| `labels` | `boolean` | `true` | Whether the destinations show their texts. With `false` they show an icon alone, and their texts as tooltips. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                                                 |
| --------- | ------------------------------------------------------------------------------------------- |
| (default) | The destinations: `el-nav-item` elements.                                                   |
| `end`     | The destinations at the lower end of a rail: the settings, the account. Not shown in a bar. |

#### CSS Parts

| Name      | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `base`    | The navigation landmark (`<nav>`): the surface and its line to the content. |
| `list`    | The list of the destinations.                                               |
| `end`     | The list of the destinations at the lower end of a rail.                    |
| `tooltip` | The tooltip of a destination that shows an icon alone: an `el-tooltip`.     |

#### CSS Custom Properties

| Name                 | Default | Description          |
| -------------------- | ------- | -------------------- |
| `--el-nav-rail-size` | `5rem`  | The width of a rail. |

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text, and `--el-color-border` and `--el-border-width` for the line to the content. The destinations read the tokens named in the readme of [`el-nav-item`](../nav-item/nav-item.readme.md).

## The bar

`layout="bar"`, and what the element is where nothing says otherwise.

- **Three to five destinations.** They share the width in equal parts, however long their texts are. More than five do not fit a phone: the fifth is "More" then, and leads to a view with the rest.
- **A short text.** One word as a rule. A text that does not fit is cut with an ellipsis: it does not wrap, and the bar keeps its height.
- The `end` slot is not shown: a bar has no room for a second group.

## The rail

`layout="rail"`: the destinations below each other, in a column of `--el-nav-rail-size`.

```html
<el-nav label="Main" layout="rail">
    <el-nav-item href="/inbox" current="true"><svg slot="icon" aria-hidden="true">…</svg>Inbox</el-nav-item>
    <el-nav-item href="/today"><svg slot="icon" aria-hidden="true">…</svg>Today</el-nav-item>
    <el-nav-item slot="end" href="/settings"><svg slot="icon" aria-hidden="true">…</svg>Settings</el-nav-item>
</el-nav>
```

- **Two groups.** The destinations at the top, and the ones in the `end` slot at the lower end: the settings, the account. Each group is a list to assistive technology.
- **As high as its place.** Give the rail a place with a height: the column of an `el-app-frame`, or an element the page sizes. With more destinations than the height takes, the group at the top scrolls, and the one at the lower end stays in view.
- **A line to the content** at the side that faces it, which follows the reading direction.

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
- Where the frame is wide, its navigation is the column at the side, and the destinations are a rail.

The stylesheets decide, by the width of the frame: the frame tells the element in a CSS property that is inherited, and nothing is written onto it. That holds before any script has run.

In both places the surface reaches the edge of the screen and the destinations stay clear of the home indicator and the notch of a phone: the region says how far its surface reaches. The line to the content is the one of the region.

The element is a navigation landmark itself. It goes into the slot without a `nav` around it.

A bar alone, with something else in the column of the wide frame, goes into the `footer` slot instead, with `narrow-only="footer"` on the frame.

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

## Server-side rendering

The element and its destinations render on a server with `@webtides/element-js-ssr-renderer`. Their look is their stylesheets: the layout, the mark of the current destination, the texts that are off the screen and the room for the home indicator are there before the script has run, and nothing moves when the elements take over. The script adds the tooltips.

## Accessibility

- A navigation landmark (`<nav>`) with the name of `label`, and in it one list of links, or two with the `end` slot.
- The current destination has `aria-current="page"`, and is told apart by more than its colour: see the readme of the destination.
- A destination that shows an icon alone has its text as its name.
- On a touch screen every destination is at least `--el-touch-target` wide and high.
- Without a theme the element paints nothing and reads as the page does, in a light and in a dark scheme. The line to the content is a border: it stays where the user forces colours, and it is there without a theme then.

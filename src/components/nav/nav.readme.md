# Nav

`nav` holds the destinations of an application: the three to five places the user goes to all the time. It is a bar for the lower edge of a phone, in reach of the thumb: each destination is an [`el-nav-item`](../nav-item/nav-item.readme.md), a link with an icon and a short text, and the one of the current view is marked.

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
| `layout` | `'bar'` | `'bar'` | How the destinations lie: `bar`, a row in which they share the width in equal parts. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                               |
| --------- | ----------------------------------------- |
| (default) | The destinations: `el-nav-item` elements. |

#### CSS Parts

| Name   | Description                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| `base` | The navigation landmark (`<nav>`): the surface of the bar and its line to the content. |
| `list` | The list of the destinations.                                                          |

#### CSS Custom Properties

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text, and `--el-color-border` and `--el-border-width` for the line to the content. The destinations read the tokens named in the readme of [`el-nav-item`](../nav-item/nav-item.readme.md).

## The destinations

- **Three to five.** They share the width in equal parts, however long their texts are. More than five do not fit a phone: the fifth is "More" then, and leads to a view with the rest.
- **A short text.** One word as a rule. A text that does not fit is cut with an ellipsis: it does not wrap, and the bar keeps its height.
- **Links.** A destination is a link with an address. The Tab key stops at every one of them: the bar is a navigation, not a menu.
- **The current one** has `current="true"`. The page sets it: the bar does not know the address of the view.

## In the frame of an application

In the footer of an [`el-app-frame`](../app-frame/app-frame.readme.md) the surface of the bar reaches the lower edge of the screen and its sides, and the destinations stay above the home indicator of a phone. The region says how far its surface reaches, so the bar needs nothing from the page. The line to the content is the one of the region there.

```html
<el-app-frame narrow-only="footer">
    <main id="main">…</main>
    <el-nav slot="footer" label="Main">…</el-nav>
</el-app-frame>
```

`narrow-only="footer"` on the frame leaves the footer out where the frame is wide: a bar at the lower edge wastes the height of a desktop, where the same destinations are a column at the side. The stylesheet of the frame does that, without a script.

The bar is a navigation landmark itself. It goes into the slot without a `nav` or a `footer` around it.

## Alone

Outside of a frame the bar keeps its destinations above the home indicator itself, and clear of the sides of a phone that lies on its side (`env(safe-area-inset-*)`, with `viewport-fit=cover` in the viewport of the page). Its place is the business of the page:

```css
el-nav.bottom {
    position: fixed;
    inset: auto 0 0;
}
```

## The on-screen keyboard

The bar does nothing about it, and does not need to. A browser lays its keyboard over the page and leaves the layout as it is: the bar is under the keyboard, and takes no room from what the user types into. Safari on iOS moves the page up while the keyboard is open, to bring the field into view, and back when it closes.

A page that asks the browser to resize its content for the keyboard (`interactive-widget=resizes-content` in the viewport) has the bar above the keyboard instead.

## Server-side rendering

The bar and its destinations render on a server with `@webtides/element-js-ssr-renderer`. Their look is their stylesheets: the equal parts, the mark of the current destination and the room for the home indicator are there before the script has run, and nothing moves when the elements take over.

## Accessibility

- A navigation landmark (`<nav>`) with the name of `label`, and in it a list of links.
- The current destination has `aria-current="page"`, and is told apart by more than its colour: see the readme of the destination.
- On a touch screen every destination is at least `--el-touch-target` wide and high.
- Without a theme the bar paints nothing and reads as the page does, in a light and in a dark scheme. The line to the content is a border: it stays where the user forces colours, and it is there without a theme then.

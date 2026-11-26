# App Frame

`app-frame` is the frame of an application: it fills what the browser shows and lays out five regions, a header, a footer, a navigation at the start side, an aside at the end side, and the content. The header and the footer stay in view, and the content scrolls between them. On a phone the regions stay clear of the notch, the rounded corners and the home indicator.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/app-frame/define';
```

```html
<el-app-frame>
    <header slot="header">…</header>
    <nav slot="navigation" aria-label="Main">…</nav>
    <main id="main">…</main>
    <aside slot="aside">…</aside>
    <footer slot="footer">…</footer>
</el-app-frame>
```

Every region but the content is optional: a region the page leaves empty takes no room.

A page that reaches under the notch and the home indicator of a phone says so in its viewport. Without `viewport-fit=cover` the system keeps the page out of that room, and the frame has nothing to do there.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-label` | `string` | `'Skip to content'` | The text of the link that skips to the content. |
| `wide-from` | `'30rem' \| '40rem' \| '48rem' \| '64rem' \| '80rem'` | `'48rem'` | The width of the frame from which the navigation and the aside are columns beside the content. Another value is the default. |

#### Read-only properties

| Name | Type | Description |
| --- | --- | --- |
| `wide` | `boolean` | Whether the frame is wide. It reads what the stylesheet has decided. |
| `scroller` | `HTMLElement` | The element that scrolls the content: the content region where the frame is wide, the one column where it is narrow. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name         | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| (default)    | The content of the view: the `main` of the page, with an id.             |
| `header`     | The region at the top, an app bar as a rule.                             |
| `navigation` | The region at the start side.                                            |
| `aside`      | The region at the end side.                                              |
| `footer`     | The region at the lower edge: a bar of destinations, or a line of state. |

#### CSS Parts

| Name         | Description                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- |
| `base`       | The frame: the grid of the regions.                                                       |
| `skip-link`  | The link that skips to the content. It shows while it has the focus.                      |
| `header`     | The region at the top. Its surface reaches under the status bar of a phone.               |
| `body`       | The navigation, the content and the aside. Where the frame is narrow, it is what scrolls. |
| `navigation` | The region at the start side.                                                             |
| `content`    | The region of the content. Where the frame is wide, it is what scrolls.                   |
| `aside`      | The region at the end side.                                                               |
| `footer`     | The region at the lower edge. Its surface reaches under the home indicator of a phone.    |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-app-frame-navigation-size` | `16rem` | The width of the navigation where the frame is wide. `auto` is the width of what is in it. |
| `--el-app-frame-aside-size` | `20rem` | The width of the aside where the frame is wide. |

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text, `--el-color-border` and `--el-border-width` for the lines between the regions, and `--el-space-2`, `--el-space-3`, `--el-radius-md`, `--el-font-size-sm`, `--el-focus-ring-width` and `--el-color-focus-ring` for the skip link.

## What the page writes, and what the frame does

The frame knows regions, not what they mean: the footer is a bar of destinations on a phone and a line of state on a desktop. So the page writes the element of every region, which says what it is, and the frame lays it out.

| Slot         | The page writes                          | Landmark                |
| ------------ | ---------------------------------------- | ----------------------- |
| `header`     | `<header slot="header">`                 | banner                  |
| `navigation` | `<nav slot="navigation" aria-label="…">` | navigation, with a name |
| (default)    | `<main id="…">`                          | main                    |
| `aside`      | `<aside slot="aside">`                   | complementary           |
| `footer`     | `<footer slot="footer">`                 | contentinfo             |

- The frame adds no landmark of its own. A component that is a navigation itself, an `el-breadcrumb` for example, goes into the slot without a `nav` around it: the landmark would be there twice.
- A page with two navigations gives each a name (`aria-label`), so a screen reader can tell them apart.
- The frame cannot make sure of the landmarks. A `<div slot="header">` is laid out as a header and is none.

## What scrolls

One thing: the content. The frame is as high as the viewport, the header and the footer are rows of it, and they cannot leave. A navigation or an aside that is longer than the frame scrolls on its own.

The window does not scroll in a frame. What follows from it:

- **A router** that sets the scroll of the window back after a change of the view does not reach the content. `scroller` is the element that scrolls it:

    ```js
    const frame = document.querySelector('el-app-frame');
    frame.scroller.scrollTo({ top: 0 });
    ```

    Ask for it when you need it: it is another element where the frame is narrow.

- **[`el-scroll-to-top`](../scroll-to-top/scroll-to-top.readme.md)** in the content scrolls the content to its top. It scrolls the element around it that scrolls, and the window where there is none.
- **[`el-scroll-to`](../scroll-to/scroll-to.readme.md)** brings its target into view as anywhere.
- **[`el-sticky`](../sticky/sticky.readme.md)** follows the scroll of the window and has nothing to do in a frame: the header of the frame stays in view by itself.
- **A phone does not take its address bar in**, because that follows the scroll of the document. The frame is as high as what shows beside the bar, in both of its states.

## Narrow and wide

Where the frame is narrow, the navigation, the content and the aside are below each other, in one column that scrolls between the header and the footer. From the width that `wide-from` names, the three are beside each other, and each scrolls on its own.

```html
<el-app-frame wide-from="64rem">…</el-app-frame>
```

- The width is one of five steps: `30rem`, `40rem`, `48rem` (the default), `64rem` or `80rem`. A stylesheet cannot read the width of a query from a custom property, so the frame has a query for each step, and another value is the default.
- The width is the one of the frame itself, not of the window. A frame in a box of the page is narrow in a narrow box.
- The stylesheet alone decides. A server does not know the width, and the frame has the right layout before the script has run. `wide` reads what the stylesheet has decided.

## The link that skips to the content

The first stop of the Tab key in the frame is a link that skips the header and the navigation. It is off the screen until it has the focus, and shows in the corner at the start then.

- Its text is `skip-label`: `<el-app-frame skip-label="Zum Inhalt">`.
- It leads to the `main` of the page, or to the first element in the default slot. Give that element an **id**: the link is a link to it (`href="#main"`), which works before the script has run. Without an id the link needs the script.
- After it, the content is in view from its start, the keys scroll it, and the Tab key goes on with the first control in it. The address of the page stays as it is.

## On a phone

With `viewport-fit=cover`, and as a web app on the home screen, the page reaches under the notch, the rounded corners and the home indicator. The frame keeps what the user reads and taps clear of them:

- The surface of the header reaches up to the edge of the screen, and what is in the header starts below the status bar. The same for the footer and the home indicator, and for the sides while the phone lies on its side.
- A column keeps the side of the screen clear that it lies at, and the content the sides that have no column.
- Without a header, or without a footer, the frame keeps that edge clear itself: the content does not scroll under the status bar.

An [`el-app-bar`](../app-bar/app-bar.readme.md) in the header draws its own surface into that room: the region tells the components in it how far its surface reaches.

For other content the room is padding of the regions, so a background on the element of the page ends where the padding starts. The surface of a region is its part:

```css
el-app-frame::part(header) {
    background: var(--el-color-bg-muted);
}
```

## Keyboard

A region that scrolls and has nothing in it that takes the focus is a stop of the Tab key itself: a text without a link, for example. Without that stop the keyboard could not scroll it. Some browsers do this by themselves, and the frame does it for the others. The stop goes when the region gets a control, or no longer scrolls.

## A frame in a box of the page

By default the frame is fixed to the edges of the viewport. For a frame in a box, a preview for example, set a position and a height on the element:

```css
el-app-frame.preview {
    position: relative;
    height: 40rem;
}
```

A frame does not go into a region of another frame: both would fill the viewport.

## The top layer

`el-dialog`, `el-drawer`, `el-popover`, `el-tooltip` and `el-toast` are in the top layer of the browser. They show over the frame from any region, and nothing in the frame clips them. The lock a dialog puts on the scroll of the document does no harm: a frame leaves the document nothing to scroll, and a modal makes the frame inert.

## Print

On paper the frame is as long as its content: it gives up its height and what scrolls, so the content prints whole.

## Server-side rendering

The frame renders on a server with `@webtides/element-js-ssr-renderer`. Its layout is its stylesheet: the regions, the width from which it is wide, and the room for the notch need no script, and nothing moves when the element takes over. The script adds the stops of the Tab key for regions without a control, and what the skip link does beyond a link.

Without server rendering, the regions of the page are below each other until the element is defined.

## Accessibility

- The landmarks are the elements of the page, see above. The frame has none, and its parts have no role.
- The skip link is the first stop of the Tab key, and has a surface and a border of its own, without a theme as well.
- The lines between the regions are borders. They stay where the user forces colours, and they are there without a theme then: nothing else tells two regions apart.
- Without a theme the frame paints nothing: it reads as the page does, in a light and in a dark scheme.
- Start and end follow the reading direction: in a text that runs from right to left the navigation is at the right.

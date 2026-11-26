# App Bar

`app-bar` is the bar at the top of a view: which view this is, a way back or to the navigation at its start, and a few actions at its end. It has one row: a title that does not fit is cut, and never pushes the actions out. In the header of an [`el-app-frame`](../app-frame/app-frame.readme.md) its surface reaches up under the status bar of a phone.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/app-bar/define';
import '@webtides/element-library/button/define';
```

```html
<el-app-bar heading-level="1">
    <el-button slot="start" circle="true" aria-label="Back" href="/tasks"><svg aria-hidden="true">…</svg></el-button>
    Answer the questions about the invoice
    <el-button slot="end" circle="true" aria-label="Search"><svg aria-hidden="true">…</svg></el-button>
    <el-button slot="end" circle="true" aria-label="More"><svg aria-hidden="true">…</svg></el-button>
</el-app-bar>
```

> Boolean attributes are passed as strings (`circle="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `heading-level` | `number` | `0` | Makes the title the heading of the view, at this level (1 to 6). Unset, the title is text. |
| `appearance` | `'filled' \| 'outlined' \| 'plain'` | `'plain'` | The appearance of the buttons in the bar that have none of their own. Reflected to the `appearance` attribute. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| (default) | The title of the view.                                                       |
| `start`   | What is in front of the title: a button back, or the one for the navigation. |
| `end`     | The actions of the view, at the end of the bar.                              |

#### CSS Parts

| Name    | Description                                        |
| ------- | -------------------------------------------------- |
| `base`  | The bar: its surface and the line to the content.  |
| `row`   | The row of the start, the title and the end.       |
| `start` | The region in front of the title.                  |
| `title` | The title. A heading while `heading-level` is set. |
| `end`   | The region at the end.                             |

#### CSS Custom Properties

Reads `--el-color-bg` and `--el-color-fg` for its surface and its text, `--el-color-border` and `--el-border-width` for the line to the content, `--el-control-height` and `--el-space-2` for its height, `--el-space-1`, `--el-space-2` and `--el-space-3` for its gaps and its padding, `--el-font-size-lg` and `--el-font-weight-semibold` for the title, and `--el-touch-target` on a touch screen.

## The title

The title is what the page writes into the bar. It is one line: what does not fit is cut with an ellipsis, and the actions at the end keep their place. The whole title stays in the page, so assistive technology reads all of it.

`heading-level` makes the title the heading of the view. A view has one `h1` as a rule, and the title of its bar is that heading:

```html
<el-app-bar heading-level="1">Inbox</el-app-bar>
```

Without the attribute the title is text. That is right for a bar whose view has its heading in the content. A heading the page writes itself (`<el-app-bar><h1>Inbox</h1></el-app-bar>`) is cut the same way, and has the size of the title.

## The start and the end

- `start` is one button as a rule: back to the view above, or the button that opens the navigation.
- `end` holds a few actions. A button with an icon alone is an `el-button` with `circle="true"` and an `aria-label`, which is its name.
- A region the page leaves empty takes no room. Start and end follow the reading direction.

The buttons of a bar are plain while they have no appearance of their own, as in an [`el-toolbar`](../toolbar/toolbar.readme.md): the bar says its `appearance` in CSS properties that are inherited, and writes nothing onto the buttons. A button that names its own keeps it (`appearance="filled"` for the one action that stands out).

The bar does not move actions that do not fit into a menu. Keep to the few a phone has room for.

## In the frame of an application

In the header of an [`el-app-frame`](../app-frame/app-frame.readme.md) the bar draws its surface as far as the surface of the region reaches: under the status bar and the notch of a phone, and to the sides of the screen. Its content stays clear of them. The region says how far that is, so the bar needs nothing from the page:

```html
<el-app-frame>
    <header slot="header">
        <el-app-bar heading-level="1">Inbox</el-app-bar>
    </header>
    <main id="main">…</main>
</el-app-frame>
```

- The bar is no landmark. The `header` around it is the banner of the page.
- The line to the content is the one of the region there, and the bar leaves its own out.
- A colour of its own goes on the part, and reaches under the status bar with it:

    ```css
    el-app-bar::part(base) {
        background: var(--el-color-bg-muted);
    }
    ```

Outside of a frame the bar is as large as its element. A page that reaches under the notch without a frame keeps the bar clear of it itself.

## On a touch screen

The bar is at least `--el-touch-target` high where the pointer is a finger (`@media (any-pointer: coarse)`), and an `el-button` in it is at least that wide and high. Without the token nothing changes.

## Server-side rendering

The bar renders on a server with `@webtides/element-js-ssr-renderer`. Its look is its stylesheet: the row, the cut title, the heading and the surface in a frame are there before the script has run, and nothing moves when the element takes over.

## Accessibility

- The title is a heading with `heading-level` (`role="heading"` with the level), and text without it.
- The bar has no role and no name of its own. It is a row in the header of the page.
- Every button with an icon alone needs a name (`aria-label`).
- Without a theme the bar paints nothing and reads as the page does, in a light and in a dark scheme. The line to the content is a border: it stays where the user forces colours, and it is there without a theme then.

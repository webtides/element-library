# Status Bar

`status-bar` is the narrow line of state at the lower edge of a tool for a desktop, an editor or an administration: whether the connection is there, what is selected, how many entries there are, a task that runs in the background, the version. It has entries at its start and at its end, in one row that keeps its height.

It is not the status bar of the system on a phone (the time, the battery). An [`el-app-frame`](../app-frame/app-frame.readme.md) deals with that one by its safe areas.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/status-bar/define';
import '@webtides/element-library/button/define';
```

```html
<el-status-bar>
    <span>Connected</span>
    <span>128 entries</span>
    <span role="status">Saved at 10:32</span>
    <el-button slot="end">main</el-button>
    <span slot="end">v1.4.2</span>
</el-status-bar>
```

## API

#### Properties/Attributes

_None._

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| (default) | The entries at the start of the bar. They give way first where the bar is too narrow. |
| `end`     | The entries at the end of the bar.                                                    |

#### CSS Parts

| Name    | Description                                       |
| ------- | ------------------------------------------------- |
| `base`  | The bar: its surface and the line to the content. |
| `row`   | The row of the entries, which keeps its height.   |
| `start` | The entries at the start.                         |
| `end`   | The entries at the end.                           |

#### CSS Custom Properties

Reads `--el-color-bg` and `--el-color-fg-muted` for its surface and its text, `--el-color-border` and `--el-border-width` for the line to the content, `--el-control-height` for its height, `--el-font-size-sm` for its text, `--el-space-2` and `--el-space-3` for its gaps and its padding, `--el-focus-ring-width` for the ring of a button in it, and `--el-touch-target` on a touch screen.

## The entries

An entry is an element the page writes into the bar. Each is one line and as wide as it is, with a gap to the next.

- **A text** is a `<span>`.
- **An icon** that stands alone has a name: `<svg role="img" aria-label="Connected">`. In front of a text it is a decoration (`aria-hidden="true"`), and the entry lays the two out itself (`display: inline-flex; align-items: center; gap: 0.375em`): the bar does not reach into an entry, and a reset of the page makes an `svg` a block as a rule.
- **A button** is an [`el-button`](../button/button.readme.md). In the bar it is as high as the bar and plain, and has the small text of the bar. The bar says so in CSS properties that are inherited and writes nothing onto the button: one that names a size or an appearance of its own keeps it. A button with an icon alone is `circle="true"` with an `aria-label`.
- **A small component**: an [`el-spinner`](../spinner/spinner.readme.md) is as large as the text, an [`el-progress-bar`](../progress-bar/progress-bar.readme.md) gets a width of `6rem` (a rule of the page for the element sets another).
- An `el-divider` with `orientation="vertical"` between two entries is as high as their text.

The entries at the start are in the default slot, the ones at the end in the slot `end`. Start and end follow the reading direction.

## The height

The bar is lower than a control: seven tenths of `--el-control-height` (`1.75rem` of `2.5rem`). It keeps that height whatever is in it, a button and a text in two lines as well: what is higher than the bar is cut.

## Entries that do not fit

Nothing wraps, and no entry lies on another.

- The entries at the start give way first: their group is cut at its end, so the last of them go.
- The entries at the end stay. Only a bar that is narrower than they are cuts them as well.
- A button in the part that is cut is still reached with the Tab key. The bar shows it while it has the focus, and its first entries again after that.

So what must stay in view goes to the end, or to the front of the start. A bar has no menu for what does not fit: an application for a phone leaves the bar out (`wide-only="footer"` on the frame).

## An entry that is announced

The bar is no live region: a count that changes with every click would be read out all the time. The page marks the one entry whose change matters, and a screen reader announces it when it has nothing else to say:

```html
<el-status-bar>
    <span>Line 12, column 4</span>
    <span role="status">Saved at 10:32</span>
</el-status-bar>
```

The entry is in the page from the start, also while it is empty: a live region that comes with its first text is not announced by every screen reader.

## In the frame of an application

In the footer of an [`el-app-frame`](../app-frame/app-frame.readme.md) the bar draws its surface as far as the surface of the region reaches: to the lower edge of the screen and to its sides. Its entries stay clear of them. The region says how far that is, so the bar needs nothing from the page:

```html
<el-app-frame>
    <main id="main">…</main>
    <footer slot="footer">
        <el-status-bar>
            <span>Connected</span>
            <span slot="end">v1.4.2</span>
        </el-status-bar>
    </footer>
</el-app-frame>
```

- The bar is no landmark. The `footer` around it is the one of the page.
- The line to the content is the one of the region there, and the bar leaves its own out.
- A colour of its own goes on the part: `el-status-bar::part(base) { background: var(--el-color-bg-muted); }`.

## On a touch screen

The bar is at least `--el-touch-target` high where the pointer is a finger (`@media (any-pointer: coarse)`), and an `el-button` in it is at least that wide and high. Without the token nothing changes.

## Server-side rendering

The bar renders on a server with `@webtides/element-js-ssr-renderer`. Its look is its stylesheet: the row, its height, what is cut and the surface in a frame are there before the script has run, and nothing moves when the element takes over. The script does one thing: it shows the first entries again after a button in the part that is cut has lost the focus.

## Accessibility

- The bar has no role and no name. Its entries are read in the order of the page: the ones at the start, then the ones at the end.
- An entry whose change is announced is marked by the page (`role="status"`).
- A button in the bar is a stop of the Tab key and shows its focus ring inside of itself: around it there is the edge of the bar, and under the bar the edge of the screen.
- An icon that stands alone needs a name, and so does a button with an icon alone.
- Without a theme the bar paints nothing and reads as the page does, in a light and in a dark scheme. The line to the content is a border: it stays where the user forces colours, and it is there without a theme then.

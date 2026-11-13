# Empty State

`empty-state` stands in the place of a list or a collection while there is nothing in it: a message in the middle, with a heading above it, an icon above that and an action below, as far as they are given. It is pure presentation, without a role and without behaviour.

It paints no surface. Its colours are the text colours of the theme, and the text colour of the page without one.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/empty-state/define';
```

```html
<el-empty-state>Nothing here yet.</el-empty-state>

<!-- With a heading and an action -->
<el-empty-state>
    <h3 slot="heading">No projects yet</h3>
    A project holds everything that belongs to one piece of work.
    <el-button slot="action" variant="brand">Create a project</el-button>
</el-empty-state>

<!-- With an icon above -->
<el-empty-state>
    <svg slot="icon" width="48" height="48" aria-hidden="true">…</svg>
    <h3 slot="heading">No results</h3>
    No project matches your search.
    <el-button slot="action">Reset the search</el-button>
</el-empty-state>
```

The action is an element of your own, with a listener of your own: the empty state fires no event.

## API

#### Properties/Attributes

_None._

#### Methods

_None._

#### Events

_None._

#### Slots

| Name        | Description                                            |
| ----------- | ------------------------------------------------------ |
| _(default)_ | The message: what is missing, and what to do about it. |
| `icon`      | An icon or an illustration above the heading.          |
| `heading`   | A short heading above the message.                     |
| `action`    | What the user can do now: a button, a link, or two.    |

#### CSS Parts

| Name      | Description                                      |
| --------- | ------------------------------------------------ |
| `base`    | The column in the middle that holds the regions. |
| `icon`    | The region of the `icon` slot.                   |
| `heading` | The region of the `heading` slot.                |
| `message` | The region of the default slot.                  |
| `action`  | The region of the `action` slot.                 |

#### CSS Custom Properties

Reads the standard library design tokens: `--el-color-fg-muted` for the message, the icon and the action, `--el-color-fg` for the heading, and `--el-space-2`, `--el-space-4` and `--el-space-5` for the gaps and the padding.

## Regions

The regions are below each other in a fixed order, whatever the order of the children: `icon`, `heading`, the message, `action`. Each of `icon`, `heading` and `action` is there when an element with its `slot` is a child of the empty state, and comes and goes with that element. A message that is not there leaves no gap.

- **`icon`** places what is slotted into it in the middle. The icon has the size you give it and the muted text colour (`currentColor`).
- **`heading`** has the text colour of the page and is semibold. The level of the heading is yours: `<h3 slot="heading">`.
- **The message** is text like any other: a link in it stays in its line.
- **`action`** lines what is slotted into it up in the middle, with a gap, and wraps.

The regions take the margins of the browser off a heading or a paragraph that is slotted into them, and space them themselves.

## Size and place

The empty state is as wide as its container, and its content is a column in the middle of it, at most `30rem` wide, so that a message stays readable in a wide place. For another width, set it on the part:

```css
el-empty-state::part(base) {
    max-width: 20rem;
}
```

Its height is the one of its content, with a padding of `--el-space-5` above and below. For an empty state that fills a place of a fixed height, centre it in that place with the layout of the page.

The `hidden` attribute hides the empty state.

## Accessibility

- An empty state is text for assistive technology, read where it stands in the page. It has no role.
- It is not announced when it appears. If a list empties while the user is on the page, after a search or a deletion, say so in a live region of the page.
- Write into the message what is missing and what to do about it. An icon alone does not say it.
- An icon that only decorates is hidden from assistive technology: `aria-hidden="true"` on an `svg`, an empty `alt` on an `img`.
- Whether the message can be read depends on the colours of the theme: `--el-color-fg-muted` needs a contrast of 4.5 : 1 to the background it stands on. With the default theme it has that on `--el-color-bg`; on the muted fill, in a `filled` card for example, it has 4.4 : 1 in a light scheme.

## Server-side rendering

The empty state is fully part of the server-rendered markup (Declarative Shadow DOM) and looks the same before and after its JavaScript has loaded. Which regions are left out is read from the children of the element, on the server as in the browser, so nothing moves when the element takes over.

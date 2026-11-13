# Card

`card` is a surface that groups what belongs together: a form, a section of settings, an entry of a list. It has four regions, each of them a slot: `media` at the top, then `header`, the body and `footer`. A region that nothing is slotted into takes no space. It is pure presentation, without a role and without behaviour.

Without a theme imported the card paints nothing and is its regions and their padding; import a theme to skin it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/card/define';
```

```html
<el-card>
    <h3 slot="header">Profile</h3>
    <p>What belongs together.</p>
    <el-button slot="footer">Save</el-button>
</el-card>

<!-- With an image at the top -->
<el-card>
    <img slot="media" alt="Hills at sunrise" src="hills.jpg" width="600" height="400" />
    <h3 slot="header">Lake house</h3>
    <p>Two rooms, a boat and a view of the water.</p>
</el-card>

<!-- A muted fill, or no surface at all -->
<el-card appearance="filled">…</el-card>
<el-card appearance="plain">…</el-card>
```

## API

#### Properties/Attributes

| Name         | Type     | Default      | Description                                                             |
| ------------ | -------- | ------------ | ----------------------------------------------------------------------- |
| `appearance` | `string` | `'outlined'` | `outlined`, `filled` or `plain`. How the surface is painted. Reflected. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| _(default)_ | The body of the card.                                                    |
| `media`     | An image or a video at the top of the card, from edge to edge.           |
| `header`    | The title of the card, and what stands beside it, an action for example. |
| `footer`    | What closes the card: actions, a note.                                   |

#### CSS Parts

| Name     | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `base`   | The surface of the card: background, border, radius, shadow. |
| `media`  | The region of the `media` slot.                              |
| `header` | The region of the `header` slot.                             |
| `body`   | The region of the default slot.                              |
| `footer` | The region of the `footer` slot.                             |

#### CSS Custom Properties

| Name | Description |
| --- | --- |
| `--el-card-padding` | The padding of the header, the body and the footer. Unset, it is `--el-space-4`, and `1rem` without a theme. |

Reads the standard library design tokens: `--el-color-bg`, `--el-color-bg-muted`, `--el-color-fg`, `--el-color-border`, `--el-border-width`, `--el-radius-lg`, `--el-shadow-md`, `--el-space-2` and `--el-space-4`.

## Regions

The regions are below each other in a fixed order, whatever the order of the children: `media`, `header`, the body, `footer`. The body is always there. Each of the other three is there when an element with its `slot` is a child of the card, and comes and goes with that element.

- **`header`** places what is slotted into it in a row and pushes it apart: a title at the start, an action at the end. Its text is semibold. The card cannot know the level of its heading in the page, so the heading is yours: `<h3 slot="header">`.
- **`footer`** lines what is slotted into it up from the start, with a gap, and wraps.
- **`media`** has no padding. An image or a video in it is as wide as the card and keeps its proportions; give an image its `width` and `height`, so the card has its height before the image has loaded. The region is round where the card is.
- The header and the footer take the margins of the browser off a heading or a paragraph that is slotted into them. The body is left alone: what is in it is content of the page.

There is one padding around the regions and one between them. `--el-card-padding` sets it for the header, the body and the footer at once; for one region alone, use its part:

```css
/* A list or a table that reaches from edge to edge, under a header that keeps its padding */
el-card.flush::part(body) {
    padding: 0;
}
```

## Appearance

| `appearance` | What is painted |
| --- | --- |
| `outlined` | A surface in the background of the page (`--el-color-bg`), with a border and a shadow. The default. |
| `filled` | The same with a muted fill (`--el-color-bg-muted`). |
| `plain` | Nothing: no background, no border, no shadow. The regions and their padding stay, and the text has the colour of where the card stands. |

The property is reflected: the element writes it onto itself as an attribute, the default included (`<el-card appearance="outlined">`), so that it can be selected from a stylesheet. A value the card does not know is painted like the default.

The shadow is `--el-shadow-md` of the theme. For a card without one: `el-card::part(base) { box-shadow: none; }`.

There is no `variant` and no `size`. A card holds content of any kind, and the colour of a variant would be the colour of all of it; for a message with a variant there is `el-notification`.

## In a grid

A card fills the height its container gives it. Cards that a grid or a flex row stretches are equally high, and their footers are in one line, because the body takes the height that is left.

The card cuts nothing off: the list of a select, a tooltip or a focus ring may reach out of it.

The `hidden` attribute hides the card.

## Accessibility

- A card is a container without a role. Its content is read where it stands in the page.
- Give a card a heading, at the level that fits the page. A screen reader user moves from heading to heading, so the heading is how a card is found.
- For a card that should be announced as a group, set the role and the name on the element: `<el-card role="group" aria-labelledby="profile-title">`, with that `id` on the heading.
- An image in `media` needs an `alt`, an empty one when it only decorates.
- A card is not a control. For a card that leads somewhere, put a link into it, into the heading for example, and do not wrap the card in a link: everything in it would be the name of that link.
- Whether the text can be read depends on the colours of the theme: `--el-color-fg` needs a contrast of 4.5 : 1 to `--el-color-bg` and to `--el-color-bg-muted`.

## Server-side rendering

The card is fully part of the server-rendered markup (Declarative Shadow DOM) and looks the same before and after its JavaScript has loaded. Which regions are left out is read from the children of the element, on the server as in the browser, so nothing moves when the element takes over.

One limit follows from that: a `<slot>` of another component that is passed on into a region (`<slot name="title" slot="header">`) counts as content, also while nothing is slotted into it.

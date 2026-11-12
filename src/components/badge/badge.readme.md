# Badge

`badge` is a short label that marks something with a status or a count: "New", "Beta", "3". It is pure presentation, without a role and without behaviour. It speaks the library's shared vocabulary for its colours: a semantic `variant` and an `appearance`.

Without a theme imported the badge has a muted surface and the text colour of the page; import a theme to skin it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/badge/define';
```

```html
<el-badge variant="brand">New</el-badge>

<!-- Outlined, or as text only -->
<el-badge variant="success" appearance="outlined">passing</el-badge>

<!-- A count, as a circle -->
<el-badge variant="danger" pill="true">3</el-badge>

<!-- Catches the eye -->
<el-badge variant="danger" pill="true" pulse="true">Live</el-badge>
```

> Boolean attributes are passed as strings (`pill="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'neutral'` | `neutral`, `brand`, `success`, `warning` or `danger`. Picks the colours. Reflected. |
| `appearance` | `string` | `'filled'` | `filled`, `outlined` or `plain`. How the colours of the variant are painted. Reflected. |
| `pill` | `boolean` | `false` | Fully rounded ends. A badge with a single character is a circle. |
| `pulse` | `boolean` | `false` | Draws attention: a ring spreads from the badge, again and again. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name        | Description            |
| ----------- | ---------------------- |
| _(default)_ | The text of the badge. |

#### CSS Parts

| Name   | Description                                           |
| ------ | ----------------------------------------------------- |
| `base` | The surface of the badge: background, border, radius. |

#### CSS Custom Properties

Reads the standard library design tokens: the colours of the variants, `--el-border-width`, `--el-radius-md` and `--el-font-family`.

Each variant reads one colour: `--el-color-accent` (`brand`), `--el-color-success`, `--el-color-warning` and `--el-color-danger`. `neutral` reads the surface tokens: `--el-color-bg-muted` for the fill, `--el-color-border` for the border and `--el-color-fg` for the text. The text on a brand, success or danger fill is `--el-color-bg`; a warning fill carries dark text.

## Variant and appearance

The two properties are independent of each other, and every combination works.

| `appearance` | What is painted |
| --- | --- |
| `filled` | The fill of the variant, its border, and the text colour for that fill. |
| `outlined` | No fill. The border and the text have the colour of the variant; `neutral` has the border colour of the theme. |
| `plain` | No fill and no border, only the text in the colour of the variant. |

Both are reflected: the element writes them onto itself as attributes, the defaults included (`<el-badge variant="neutral" appearance="filled">`), so that they can be selected from a stylesheet (`el-badge[variant='danger']`). A value the badge does not know is painted like the default.

## Size

There is no `size`. A badge is three quarters of the font size of the text it stands in, and its paddings follow: in a heading it is larger than in a paragraph. For a badge of another size, set a font size on it:

```css
el-badge.large {
    font-size: 1.25rem; /* the text of the badge is three quarters of that */
}
```

A badge with a single character is as wide as it is high: a square, and a circle with `pill`.

The `hidden` attribute hides the badge.

## Accessibility

- A badge is text for assistive technology, read where it stands in the page. It has no role. A change of its text is not announced; for a count that has to be announced when it changes, put the badge into a live region of the page.
- A status must not be told by the colour alone: write it into the badge ("Failed"), and do not leave it to a red badge without a word.
- A bare count has no meaning out of context. Add what it counts for a screen reader, with the `el-visually-hidden` class of `styles/utilities.css` for example: `<el-badge>3 <span class="el-visually-hidden">unread messages</span></el-badge>`.
- The text of a badge is small. Whether it can be read depends on the colours of the theme: the text on a fill needs a contrast of 4.5 : 1 to the colour of its variant.
- `pulse` stands still for a user who prefers reduced motion (`prefers-reduced-motion: reduce`).

## Server-side rendering

The badge is fully part of the server-rendered markup (Declarative Shadow DOM) and looks the same before and after its JavaScript has loaded.

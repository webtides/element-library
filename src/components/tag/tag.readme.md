# Tag

`tag` is a label for one of several things that belong to something: a keyword of an article, a filter that is set, a recipient. With `removable` it has a button that asks to take it away. It speaks the library's shared vocabulary: a semantic `variant`, an `appearance` and a `size`.

Without a theme imported the tag has a muted surface and the text colour of the page; import a theme to skin it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tag/define';
```

```html
<el-tag>TypeScript</el-tag>

<!-- Coloured, outlined, as a pill -->
<el-tag variant="brand" appearance="outlined" pill="true">Design</el-tag>

<!-- With a remove button -->
<el-tag removable="true">Svelte</el-tag>
```

```js
// The tag does not remove itself: the page decides what removing means.
document.querySelector('.filters').addEventListener('tag-remove', (event) => {
    event.target.remove();
});
```

> Boolean attributes are passed as strings (`removable="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'neutral'` | `neutral`, `brand`, `success`, `warning` or `danger`. Picks the colours. Reflected. |
| `appearance` | `string` | `'filled'` | `filled`, `outlined` or `plain`. How the colours of the variant are painted. Reflected. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`. Reflected. |
| `pill` | `boolean` | `false` | Fully rounded ends. |
| `removable` | `boolean` | `false` | Whether to render the remove button. |
| `remove-label` | `string` | `'Remove'` | The word the remove button is named with, in front of the text of the tag. |

#### Methods

_None._

#### Events

| Name         | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `tag-remove` | The remove button was activated. Bubbles and crosses shadow boundaries. |

#### Slots

| Name        | Description          |
| ----------- | -------------------- |
| _(default)_ | The text of the tag. |

#### CSS Parts

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `base`          | The surface of the tag: background, border, radius.               |
| `content`       | The wrapper around the default slot. A text too long is cut here. |
| `remove-button` | The remove button (present only while `removable`).               |

#### CSS Custom Properties

Reads the standard library design tokens: the colours of the variants, `--el-control-height`, `--el-space-*`, `--el-font-size-*`, `--el-font-family`, `--el-border-width`, `--el-radius-md`, `--el-radius-sm`, `--el-focus-ring-width` and `--el-touch-target`.

Each variant reads one colour: `--el-color-accent` (`brand`), `--el-color-success`, `--el-color-warning` and `--el-color-danger`. `neutral` reads the surface tokens: `--el-color-bg-muted` for the fill, `--el-color-border` for the border and `--el-color-fg` for the text. The text on a brand, success or danger fill is `--el-color-bg`; a warning fill carries dark text.

## Variant, appearance and size

The three properties are independent of each other, and every combination works.

| `appearance` | What is painted |
| --- | --- |
| `filled` | The fill of the variant, its border, and the text colour for that fill. |
| `outlined` | No fill. The border and the text have the colour of the variant; `neutral` has the border colour of the theme. |
| `plain` | No fill and no border, only the text in the colour of the variant. |

A tag is the small sibling of a control of the same size, so that it fits into a field: it is 0.7 times as high (28 px for `medium` with the default theme, 22.4 px for `small`, 35 px for `large`), has half the padding, and a font size one step down.

All three are reflected: the element writes them onto itself as attributes, the defaults included (`<el-tag variant="neutral" appearance="filled" size="medium">`), so that they can be selected from a stylesheet (`el-tag[variant='brand']`). A value the tag does not know is painted like the default.

A tag is never wider than the place it stands in. A text that does not fit is cut off with an ellipsis, and the remove button stays.

The `hidden` attribute hides the tag.

## Removing

The remove button fires `tag-remove` and does nothing else. The tag stays where it is until the page takes it away: out of a list, out of the state a framework renders the list from, or by clearing the filter it stands for. A tag that removed itself would leave such a state behind.

The event bubbles, so one listener on the list serves all of its tags; `event.target` is the tag.

## Accessibility

- A tag is text for assistive technology, read where it stands in the page. It has no role. For a list of tags, use a list: `<ul>` with one tag per `<li>`.
- The remove button is a native `<button>`: it is in the tab order and works with Enter and Space.
- Its name is the `remove-label` followed by the text of the tag: "Remove TypeScript". Several tags in a row would otherwise have buttons that all sound the same. Set `remove-label` to translate the word.
- The focus ring of the button has the text colour of the tag, which shows on every fill.
- On a touch screen (`@media (any-pointer: coarse)`) the remove button is at least `--el-touch-target` wide and high. The cross keeps its size and the tag grows with the button. Without that token, and on a fine pointer, the sizes stay as they are.
- A status must not be told by the colour alone: write it into the tag.
- After a tag is removed, the focus is gone with its button. Move it to a sensible place in the listener, the next tag or the field the tags belong to.

## Server-side rendering

The tag, and its remove button with its name, are part of the server-rendered markup (Declarative Shadow DOM). The button works once the JavaScript of the element has loaded.

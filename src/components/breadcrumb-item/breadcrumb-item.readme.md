# Breadcrumb Item

`breadcrumb-item` is one entry of an [`el-breadcrumb`](../breadcrumb/breadcrumb.readme.md): a link to a page on the way to the current one with `href`, plain text without. `current` marks the entry of the page the user is on.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/breadcrumb/define';
import '@webtides/element-library/breadcrumb-item/define';
```

```html
<el-breadcrumb>
    <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
    <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
    <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
</el-breadcrumb>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | `''` | The address of the page. Unset, the entry is text and no link. |
| `target` | `string` | `''` | Where to open the page (only with `href`). |
| `rel` | `string` | `'noreferrer noopener'` | `rel` attribute for the link, written when `target` is set. |
| `current` | `boolean` | `false` | The entry is the page the user is on: it gets `aria-current="page"`. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                   |
| --------- | --------------------------------------------- |
| (default) | The name of the page, with an icon if wanted. |

#### CSS Parts

| Name        | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| `base`      | The entry: an item of the list of the breadcrumb.                                           |
| `separator` | What stands in front of the entry. Hidden for the first one, and from assistive technology. |
| `label`     | The name of the page: an `<a>` with `href`, a `<span>` without.                             |

#### CSS Custom Properties

| Name                        | Default | Description                                         |
| --------------------------- | ------- | --------------------------------------------------- |
| `--el-breadcrumb-separator` | `'/'`   | What stands in front of the entry, as a CSS string. |

## Link or text

With `href` the entry is a native `<a>`: it can be reached with the keyboard, opened in a new tab and followed by a router that listens for clicks on links. `target` is passed on, and `rel` is written with it.

Without `href` the entry is text. That is the usual form of the last entry, the current page, and of a step on the way that has no page of its own.

## The current page

`current` marks the page the user is on. The entry gets `aria-current="page"`, the text colour of the theme and a heavier weight, whether it is text or a link. A weight, not only a colour: the current page is told from the others without seeing colours, and without a theme.

The breadcrumb does not mark the last entry by itself. Set `current` where the trail is written.

## Look

A link has the accent colour of the theme and is underlined under the pointer. Without a theme imported it has the text colour. The focus of the keyboard shows with the focus ring of the theme.

An icon is part of what is slotted into the item, in front of the name or in its place; the two stand in a row with a small gap. An icon that stands alone needs a name:

```html
<el-breadcrumb-item href="/"><svg aria-label="Home" role="img">…</svg></el-breadcrumb-item>
```

On a touch screen (`any-pointer: coarse`) a link is at least `--el-touch-target` wide and high. Text stays as it is.

Other colours go on the part: `el-breadcrumb-item::part(label) { color: inherit; }`.

The `hidden` attribute hides the entry, with its separator.

## Accessibility

- The entry is an item of the list of the breadcrumb (`role="listitem"`). Use it inside of an `el-breadcrumb` only: an item of a list needs its list.
- A link is named by what is slotted into the item.
- The separator is hidden from assistive technology (`aria-hidden`), and it is not part of the link: the name of the link is the name of the page.
- `aria-current="page"` is on the link or the text itself, where a screen reader announces it with the name of the page.

## Server-side rendering

The role of the entry, its link, `aria-current` and the separator are part of the server-rendered markup (Declarative Shadow DOM). Which entry is the first, and so has no separator, is decided by the stylesheet. The entry is complete before its JavaScript has loaded, and without JavaScript.

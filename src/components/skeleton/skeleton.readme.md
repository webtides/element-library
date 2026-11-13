# Skeleton

`skeleton` is a quiet shape in the place of content that is still loading: a line of text, an image, an avatar. By default it is a line, as wide as its container and as high as the text it stands in for. A width, a height and a radius make it any other shape.

It shows without a theme: its colour is a share of the text colour.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/skeleton/define';
```

```html
<!-- Three lines of text -->
<div aria-busy="true">
    <el-skeleton effect="sheen" style="width: 40%"></el-skeleton>
    <el-skeleton effect="sheen"></el-skeleton>
    <el-skeleton effect="sheen" style="width: 80%"></el-skeleton>
</div>

<!-- An avatar -->
<el-skeleton style="width: 3rem; height: 3rem; --el-skeleton-radius: 50%"></el-skeleton>

<!-- An image, three to two -->
<el-skeleton style="height: auto; aspect-ratio: 3 / 2"></el-skeleton>
```

The skeleton does not space itself: the lines above are apart because their container says so (`display: grid; gap: 0.75rem`, for example).

## API

#### Properties/Attributes

| Name     | Type     | Default  | Description                                                                |
| -------- | -------- | -------- | -------------------------------------------------------------------------- |
| `effect` | `string` | `'none'` | `none`, `sheen` or `pulse`. How the shape moves while it waits. Reflected. |

#### Methods

_None._

#### Events

_None._

#### Slots

_None._ A skeleton holds no content.

#### CSS Parts

| Name   | Description |
| ------ | ----------- |
| `base` | The shape.  |

#### CSS Custom Properties

| Name | Description |
| --- | --- |
| `--el-skeleton-color` | The colour of the shape. Unset, it is an eighth of the text colour: `--el-color-fg`, and the text colour of the page without a theme. |
| `--el-skeleton-sheen-color` | The colour of the band that passes over the shape with `effect="sheen"`. Unset, it is a third of the colour of the shape. |
| `--el-skeleton-radius` | The radius of the shape. Unset, it is `--el-radius-md`, and `4px` without a theme. |

## Size and shape

The size is set on the element, like on any block:

| For                                  | Set                                               |
| ------------------------------------ | ------------------------------------------------- |
| a line of text                       | nothing, or a `width` for a line that ends early  |
| a block of a fixed size              | `width` and `height`                              |
| a picture that keeps its proportions | `height: auto` and an `aspect-ratio`              |
| a circle                             | `width`, `height` and `--el-skeleton-radius: 50%` |

A line is `1em` high: the size of the text it stands in for, which is less than the height of a line of that text. In a heading it is higher than in a paragraph.

There is no `size` and no `variant`: a skeleton has the size of what it stands in for, and no meaning of its own.

The `hidden` attribute hides the skeleton.

## Effect

| `effect` | What moves                                                                           |
| -------- | ------------------------------------------------------------------------------------ |
| `none`   | Nothing. The default.                                                                |
| `sheen`  | A lighter band passes over the shape, from the left to the right, every two seconds. |
| `pulse`  | The shape fades and comes back, every two seconds.                                   |

The property is reflected: the element writes it onto itself as an attribute, the default included (`<el-skeleton effect="none">`). A value the skeleton does not know stands still.

Both effects stand still for a user who prefers reduced motion (`prefers-reduced-motion: reduce`).

## Colour

The colour is an eighth of the text colour, not a grey of its own. That way it shows on the background of the page and on a muted fill, in a light scheme and in a dark one, and without a theme. Set `--el-skeleton-color` for another one, on the element or on anything around it.

## Accessibility

- A skeleton says nothing to assistive technology: it has no role, no name and no content. That it is there tells a sighted user that something is loading; another user has to be told in another way.
- Set `aria-busy="true"` on the region whose content is loading, and take it off when the content is there. In a live region the changes are announced once it is off.
- `aria-busy` alone is not announced by every screen reader. Say what is loading in a text as well, hidden from the eye if need be, with the `el-visually-hidden` class of `styles/utilities.css` for example: `<span class="el-visually-hidden">Loading the members</span>`.
- Give the skeletons the size of the content they stand in for, so that the page does not move when the content arrives.
- For a wait without a known shape, a submit for example, `el-spinner` says more: it has a role and a label.

## Server-side rendering

The skeleton is fully part of the server-rendered markup (Declarative Shadow DOM) and looks the same before and after its JavaScript has loaded, its effect included.

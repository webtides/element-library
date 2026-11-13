# Avatar

`avatar` is the picture that stands for a person or a thing. It shows the first of these that it has: the image, the initials, an icon. An image that cannot be loaded makes way for the next.

It shows without a theme: its background is a share of the text colour.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/avatar/define';
```

```html
<!-- The image, and the initials in case it cannot be loaded -->
<el-avatar label="Ada Lovelace" image="/people/ada.jpg" initials="AL"></el-avatar>

<!-- Initials alone, or nothing but the icon -->
<el-avatar label="Grace Hopper" initials="GH"></el-avatar>
<el-avatar label="Unknown user"></el-avatar>

<!-- Beside the name: a decoration, without a label -->
<span><el-avatar size="small" initials="AL"></el-avatar> Ada Lovelace</span>

<!-- An icon of your own -->
<el-avatar label="Build bot" shape="rounded">
    <svg slot="icon" width="24" height="24" aria-hidden="true">…</svg>
</el-avatar>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `image` | `string` | `''` | The address of the image. |
| `label` | `string` | `''` | The accessible name, the name of the person for example. Without it the avatar is hidden from assistive technology. |
| `initials` | `string` | `''` | One or two letters that are shown without an image. |
| `shape` | `string` | `'circle'` | `circle`, `square` or `rounded`. Reflected. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`: the width and the height, the control height of that size. Reflected. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name   | Description                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------- |
| `icon` | The icon that is shown without an image and without initials. Unset, it is the outline of a person. |

#### CSS Parts

| Name       | Description                                                                     |
| ---------- | ------------------------------------------------------------------------------- |
| `base`     | The shape of the avatar: background, radius. It carries the role and the label. |
| `image`    | The image.                                                                      |
| `initials` | The initials.                                                                   |
| `icon`     | The region of the `icon` slot.                                                  |

#### CSS Custom Properties

| Name               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `--el-avatar-size` | The width and the height of the avatar. Unset, the `size` decides. |

Reads the standard library design tokens: `--el-color-fg`, `--el-control-height`, `--el-radius-md` and `--el-font-family`.

## What it shows

1. The image, when `image` is set and the image can be loaded. It fills the avatar and is cut to its shape, not squeezed into it.
2. The initials, when `initials` is set. They are written as given: the avatar does not derive them from the label and does not change their case.
3. The icon: what is slotted into `icon`, and the outline of a person without that.

An image that cannot be loaded makes way for the initials or the icon. That holds for an image of server-rendered markup that had failed before the element was there, too. A new address in `image` is tried again.

While an image is loading, the avatar shows its background.

## Shape and size

| `shape`   |                                                            |
| --------- | ---------------------------------------------------------- |
| `circle`  | A circle. The default.                                     |
| `square`  | A square with sharp corners.                               |
| `rounded` | A square with the corners of the theme (`--el-radius-md`). |

| `size`   | With a control height of 2.5rem            |
| -------- | ------------------------------------------ |
| `small`  | 0.8 times `--el-control-height`: 2rem      |
| `medium` | `--el-control-height`: 2.5rem              |
| `large`  | 1.25 times `--el-control-height`: 3.125rem |

2.5rem is the control height of the default and the sketchy theme, and the one without a theme; the high-contrast theme has 2.75rem. A button of the same size is at least that high, and a few pixels higher where its border and its text need more.

For any other size set `--el-avatar-size`, on the element or on anything around it; the `size` attribute has no say then:

```css
.profile el-avatar {
    --el-avatar-size: 6rem;
}
```

The initials are two fifths of the avatar high, the icon three fifths. An icon of your own that is sized in `em` grows with the avatar as well.

Both properties are reflected: the element writes them onto itself as attributes, the defaults included (`<el-avatar shape="circle" size="medium">`). A value the avatar does not know is treated like the default.

There is no `variant`. For a background of your own, per person for example, paint the part: `el-avatar::part(base) { background: … }`.

The avatar stands in a line of text, in the middle of it (`inline-block`). The `hidden` attribute hides it.

## Accessibility

- With a `label` the avatar is an image with that name (`role="img"`), whatever it shows: the image, the initials or the icon. A screen reader reads the name, not the two letters.
- Without a `label` it is hidden from assistive technology. That is right where the name is written out beside it, and wrong where the avatar stands alone: give it a label there.
- An avatar is not a control. One that opens a menu or leads to a profile goes into a button or a link, which gets the name; the avatar inside needs no label then.
- The initials have the text colour on an eighth of that colour, a contrast far above 4.5 : 1 in every shipped theme.

## Server-side rendering

The avatar is fully part of the server-rendered markup (Declarative Shadow DOM): the image, the initials or the icon, the role and the name. An image that fails to load before the JavaScript has arrived stays a broken image until then, and makes way for the initials or the icon as soon as the element takes over.

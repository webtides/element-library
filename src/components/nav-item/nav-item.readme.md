# Nav Item

`nav-item` is one destination of an [`el-nav`](../nav/nav.readme.md): a link with an icon and a short text under it. The destination of the current view is marked. It is the same in a bar and in a rail.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/nav/define';
import '@webtides/element-library/nav-item/define';
```

```html
<el-nav label="Main">
    <el-nav-item href="/inbox" current="true">
        <svg slot="icon" aria-hidden="true">…</svg>
        Inbox
        <el-badge slot="badge" variant="danger" pill="true">12</el-badge>
    </el-nav-item>
</el-nav>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | `''` | The address the destination leads to. |
| `target` | `string` | `''` | Where to open the address. |
| `rel` | `string` | `'noreferrer noopener'` | `rel` attribute for the link, written when `target` is set. |
| `current` | `boolean` | `false` | The destination of the current view: the link gets `aria-current="page"`, a heavier text and a shape behind its icon. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                            |
| --------- | ---------------------------------------------------------------------- |
| (default) | The short text of the destination. One line: what does not fit is cut. |
| `icon`    | The icon of the destination: a decoration, the text is the name.       |
| `badge`   | A count or a dot at the corner of the icon, an `el-badge` as a rule.   |

#### CSS Parts

| Name    | Description                                                            |
| ------- | ---------------------------------------------------------------------- |
| `base`  | The entry of the list (`role="listitem"`).                             |
| `link`  | The link: the whole destination is its target.                         |
| `icon`  | The icon, with the shape behind it that marks the current destination. |
| `label` | The text of the destination.                                           |
| `badge` | The place of the badge, at the corner of the icon.                     |

#### CSS Custom Properties

Reads `--el-color-fg-muted` for a destination and `--el-color-fg` for the current one, `--el-color-bg-muted` for the shape behind the icon, `--el-font-size-xs` for the text and `--el-font-size-md` for the icon, `--el-control-height`, `--el-space-1`, `--el-space-2` and `--el-space-3` for its sizes, `--el-focus-ring-width` and `--el-color-focus-ring` for the focus, and `--el-touch-target` on a touch screen.

## The icon and the text

The icon is a decoration: give it `aria-hidden="true"`. The text is the name of the destination, so keep it to a word or two. It is one line, and what does not fit is cut with an ellipsis. Assistive technology reads all of it.

Where the `el-nav` shows icons alone (`labels="false"`), the text is off the screen. It stays the name of the link, and the `el-nav` shows it as a tooltip. Write the text in every case.

## The current destination

`current="true"` marks the destination of the view the user is at. The link gets `aria-current="page"`, and for the eye:

- the colour of the text instead of the muted one,
- a heavier text,
- a shape behind the icon.

The weight and the shape are there for a user who does not see the difference of two colours. Where the user forces colours the shape is an outline: it has a border. Without a theme the weight is what marks the destination.

## A count or a dot

An `el-badge` in the `badge` slot sits on the corner of the icon and takes no room. It is part of the link and comes after the text, so a screen reader reads it with the name: "Inbox 12". Say what a bare number counts, and give a dot a text, for assistive technology alone:

```html
<el-badge slot="badge" pill="true">12 <span class="el-visually-hidden">unread</span></el-badge>
```

## Accessibility

- An entry of a list (`role="listitem"`) with a link in it. The whole destination is the target of the link.
- The focus of the keyboard shows as a ring inside of the destination.
- On a touch screen the link is at least `--el-touch-target` wide and high. Without the token nothing changes.
- The shape of a destination under the pointer shows only where a pointer can hover.

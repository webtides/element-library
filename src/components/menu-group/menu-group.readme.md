# Menu Group

`menu-group` is a group of entries in an [`el-menu`](../menu/menu.readme.md): the entries that belong together, under a heading where the group has one.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/menu/define';
import '@webtides/element-library/menu-group/define';
import '@webtides/element-library/menu-item/define';
```

```html
<el-menu>
    <el-button slot="trigger">File</el-button>
    <el-menu-item value="open">Open</el-menu-item>
    <el-menu-group label="Share">
        <el-menu-item value="mail">Mail</el-menu-item>
        <el-menu-item value="link">Copy link</el-menu-item>
    </el-menu-group>
</el-menu>
```

## API

#### Properties/Attributes

| Name    | Type     | Default | Description                                                      |
| ------- | -------- | ------- | ---------------------------------------------------------------- |
| `label` | `string` | `''`    | The heading of the group, and its name for assistive technology. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                        |
| --------- | -------------------------------------------------- |
| (default) | The entries of the group: `el-menu-item` elements. |

#### CSS Parts

| Name    | Description                       |
| ------- | --------------------------------- |
| `base`  | The group, with the line over it. |
| `label` | The heading of the group.         |

#### CSS Custom Properties

Reads `--el-color-border` and `--el-border-width` for the line, `--el-space-1`, `--el-space-2` and `--el-space-3` for the room around it and the heading, and `--el-color-fg-muted` and `--el-font-size-xs` for the heading.

## The line

A group has a line over it, which divides it from what is before it in the menu. A group that is the first thing in its menu has none. Entries that follow a group without a group of their own have no line over them: put them into a group, or an [`el-divider`](../divider/divider.readme.md) between.

## Accessibility

- A group (`role="group"`) with `label` as its name. A screen reader says the name when the focus enters the group.
- The heading the eye sees is hidden from assistive technology, so it is not read a second time.
- The arrow keys move through the entries of all groups as through one row.
- Where the user forces colours the line is there without a theme as well.

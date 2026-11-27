# List

`list` is a list of rows: messages, articles, files, the entries of a settings page. The list is the surface and the list for assistive technology; every [`el-list-item`](../list-item/list-item.readme.md) in it is one row. It gives its rows one density, one line between two of them, and one place where their texts begin.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/list/define';
import '@webtides/element-library/list-item/define';
```

```html
<el-list label="Messages">
    <el-list-item href="/messages/1" mark="Unread">
        <el-avatar slot="start" initials="AL" label="Ada Lovelace"></el-avatar>
        Ada Lovelace
        <span slot="description">The notes on the engine are ready for you.</span>
        <time slot="end" datetime="09:12">09:12</time>
    </el-list-item>
    <el-list-item href="/messages/2" current="true">
        <el-avatar slot="start" initials="GH" label="Grace Hopper"></el-avatar>
        Grace Hopper
        <span slot="description">Found it. A moth, in relay 70.</span>
        <time slot="end" datetime="08:40">08:40</time>
    </el-list-item>
</el-list>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `''` | The name of the list for assistive technology. Unset, the list has none. |
| `density` | `'default' \| 'compact'` | `'default'` | How much room a row has above and below its texts. Reflected to the `density` attribute. |
| `appearance` | `'plain' \| 'outlined' \| 'filled'` | `'plain'` | How the surface is painted: not at all, or as a card with the background of the page or a muted fill. Reflected to the `appearance` attribute. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                        |
| --------- | ---------------------------------- |
| (default) | The rows: `el-list-item` elements. |

#### CSS Parts

| Name   | Description                               |
| ------ | ----------------------------------------- |
| `base` | The list (`role="list"`) and its surface. |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-list-padding-inline` | `--el-space-4` | The padding of a row at its start and its end. Read by the rows, so it can be set on the list or for the page. Without a theme it is `1rem`. |
| `--el-list-gap` | `--el-space-3` | The gap between the start, the texts, the end and the control of a row. Read by the rows as well. Without a theme it is `0.75rem`. See [the gaps of a row](../list-item/list-item.readme.md#the-gaps-of-a-row). |

## Where the texts begin

What stands at the start of a row differs: an avatar in one row, a small icon in the next, nothing in a third. The texts of all rows of a list begin on one line all the same, after the widest start of the list. The list has two columns, the start and the rest, and every row takes them over (`subgrid`). A list in which no row has a start has no first column: its texts begin at the padding of the row.

A `mark` of a row (an unread message) is a dot in that padding. It moves nothing.

## Density

`density="compact"` gives a row less room above and below its texts: `--el-space-2` in the place of `--el-space-3`, `0.5rem` in the place of `0.75rem` without a theme. Nothing else changes: the texts, the gap and the padding at the sides are the same.

On a touch screen (`@media (any-pointer: coarse)`) a row that is a link is at least `--el-touch-target` high in either density. A row that is no target stays as compact as it is.

## From edge to edge, and as a card

- `appearance="plain"`, the default: no surface. The list is as wide as its place, and a line reaches from one edge of it to the other. That is the list of a phone screen, or of a column that is one.
- `appearance="outlined"`: the surface of an `el-card`, with the background of the page, a border, round corners and the shadow of the theme.
- `appearance="filled"`: the same with the muted fill.

Between two rows is a line in `--el-color-border`, `--el-border-width` wide. Without a theme the list is headless: no line, no border, no fill.

A list in the body of an `el-card` has the padding of the card around it. `--el-list-padding-inline: 0` puts its rows on the line of the other content of the card:

```html
<el-card>
    <strong slot="header">Folders</strong>
    <el-list label="Folders" style="--el-list-padding-inline: 0">
        <el-list-item href="/inbox">Inbox <span slot="end">12</span></el-list-item>
        <el-list-item href="/drafts">Drafts <span slot="end">2</span></el-list-item>
    </el-list>
</el-card>
```

The `hidden` attribute hides the list, and a row.

## Accessibility

- The list has `role="list"`, and every row is an item of it: a screen reader says how many rows the list has and where its user is in it.
- `label` names the list. A screen reader reads the name when its user enters the list; without it the list has none. A list of links that is the navigation of a page belongs into a `<nav>` of the page.
- The list has no keyboard model of its own. The Tab key goes from one link or control to the next, in the order of the rows.

## Server-side rendering

The list, its name and the rows are part of the server-rendered markup (Declarative Shadow DOM), with their links. The list runs no script: it looks the same before and after its JavaScript has loaded, its links work before that, and without JavaScript.

## What it is not

- No choice of several rows, no reordering by dragging, no swipe actions and no virtual scrolling.
- No groups with headings. Write a heading and a list after it for each group.

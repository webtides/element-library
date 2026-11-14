# Breadcrumb

`breadcrumb` is the trail from the start page to the current page, for a page deep inside of a site: a product in a category, a setting in a section. The breadcrumb is the landmark and the list; every [`el-breadcrumb-item`](../breadcrumb-item/breadcrumb-item.readme.md) in it is one entry.

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
    <el-breadcrumb-item href="/shoes/running">Running</el-breadcrumb-item>
    <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
</el-breadcrumb>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name    | Type     | Default        | Description               |
| ------- | -------- | -------------- | ------------------------- |
| `label` | `string` | `'Breadcrumb'` | The name of the landmark. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| (default) | The entries: `el-breadcrumb-item` elements, from the start page to the current page. |

#### CSS Parts

| Name   | Description              |
| ------ | ------------------------ |
| `base` | The `nav` landmark.      |
| `list` | The list of the entries. |

#### CSS Custom Properties

| Name                        | Default | Description                                                          |
| --------------------------- | ------- | -------------------------------------------------------------------- |
| `--el-breadcrumb-separator` | `'/'`   | What stands between two entries, as a CSS string. Read by the items. |

## The entries

The entries are written in the order of the trail, the start page first. An entry with `href` is a link, the others are text. Mark the entry of the page the user is on with `current`: it is the last one, and it can be text or a link.

The breadcrumb does nothing with its entries from a script: it does not count them, mark the last one or leave any out. What the trail shows is what the page writes into it.

## Separator

`--el-breadcrumb-separator` is a CSS string. Every entry but the first shows it in front of itself. Set it on the breadcrumb, or once for the whole page:

```css
:root {
    --el-breadcrumb-separator: '›';
}
```

A separator that points (`›`, `→`) has to point the other way in a text that runs from right to left; the default `/` does not need that:

```css
[dir='rtl'] {
    --el-breadcrumb-separator: '‹';
}
```

The separator has the muted text colour of the theme. It is hidden from assistive technology.

## A trail that does not fit

The trail breaks into a second line where its container is too narrow, and every line after the first starts with a separator. A name that is longer than the container breaks inside of its entry. The gap between the entries is `--el-space-2`, the one between two lines `--el-space-1`.

The `hidden` attribute hides the breadcrumb.

## Accessibility

- The breadcrumb is a navigation landmark (`<nav>`) named by `label`, "Breadcrumb" by default. Set `label` to translate it. A screen reader lists the landmarks of a page by these names, so the name should not be the one of the main navigation.
- Inside of it is a list, and every item is an entry of that list: a screen reader says how many entries the trail has and where its user is in it.
- The entry with `current` carries `aria-current="page"`, which a screen reader announces as "current page".
- The separators are not read out.
- A breadcrumb is a second way through the site, next to its main navigation. Put it at the start of the main content, where it is the same on every page.

## Server-side rendering

The landmark, its name and the list are part of the server-rendered markup (Declarative Shadow DOM), and so are the entries, their links and their separators. The breadcrumb is complete before its JavaScript has loaded, and without JavaScript.

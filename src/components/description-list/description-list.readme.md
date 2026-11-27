# DescriptionList

`description-list` shows values under their names: the address, the plan, the day an entry was created. It is the native `<dl>`; the page writes the names as `<dt>` and the values as `<dd>` into it. In a narrow place a name stands above its value, in a wide one the two stand side by side, with the values of all rows on one line. A row can end in an action.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/description-list/define';
```

```html
<el-description-list>
    <dt>Plan</dt>
    <dd>Team, 12 seats</dd>
    <dd data-action>
        <el-button size="small" appearance="plain" href="/plan" aria-label="Change the plan">Change</el-button>
    </dd>

    <dt>Address</dt>
    <dd>12 Garden Road<br />1017 Amsterdam</dd>

    <dt>Created</dt>
    <dd><time datetime="2026-03-12">12 March 2026</time></dd>
</el-description-list>
```

## API

#### Properties/Attributes

_None._

#### Methods

_None._

#### Events

_None._

#### Slots

| Name | Description |
| --- | --- |
| (default) | The rows: for each one a `<dt>` with the name, a `<dd>` with the value (or several), and, to end the row in an action, a `<dd data-action>`. |

#### CSS Parts

| Name   | Description |
| ------ | ----------- |
| `base` | The `<dl>`. |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-description-list-term-width` | as wide as the longest name | The width of the column of the names while names and values stand side by side. The gap to the values comes after it. Unset, the column is as wide as the longest name, and takes 40% of the list at most together with that gap. |
| `--el-description-list-padding-block` | `--el-space-3` | The room above and below a row. Without a theme it is `0.75rem`. |
| `--el-description-list-gap` | `--el-space-4` | The gap between a name and its value while they stand side by side, and in front of an action. Without a theme it is `1rem`. |

## What the page writes

The element takes the place of the `<dl>`: the `<dl>` itself is inside of the element, and what the page writes into the element are its children.

- A `<dt>` for the name, then a `<dd>` for the value. A row begins with its `<dt>`.
- A name can have several values, a `<dd>` each. Each of them has a row of its own, without a line above it.
- `<dt>` and `<dd>` are direct children of the element. A `<div>` around a name and its value, as a `<dl>` allows it, is not laid out: the list cannot reach into it.
- The look of a name and of a value is given to the elements of the page (`::slotted`). A rule of the page for `dt` or `dd` wins over it, property by property: its colour, its size, its weight.
- The list takes nothing from the margin, the padding or the border of a `<dt>` or a `<dd>`. See [a reset of the page](#a-reset-of-the-page).

A tool that checks the markup of the page alone reports a `<dt>` that is not in a `<dl>`. In the tree the browser lays out and reads to assistive technology, it is.

## Narrow and wide

The list measures its own width (a container query), not the one of the viewport. So it stacks in a narrow column of a wide page, a drawer for example.

- **Below 30rem** a name stands above its value, in the smaller and quieter text of the theme. An action stands at the end of the row, on the line of the value.
- **From 30rem** name and value stand side by side. The column of the names is as wide as the longest name, and with the gap after it 40% of the list at most; a longer name breaks. The values of all rows begin on one line, and the actions end on one.

`--el-description-list-term-width` sets the width of the names, so that two lists on a page have their values on one line. The values begin one gap (`--el-description-list-gap`) after it:

```css
el-description-list {
    --el-description-list-term-width: 12rem;
}
```

## An action

A `<dd data-action>` ends its row in an action: a link, or a small plain button. It stands at the end of the row, in the middle of the first line of the value. A button is higher than a line of text; it reaches out of that line, and the row stays as high as a row without an action.

The action has to say what it changes. "Change" five times in a list tells a screen reader user nothing, who may reach the control without its row. Give it a name that starts with what can be seen and goes on with the name of the row:

```html
<dd data-action><a href="/plan" aria-label="Change the plan">Change</a></dd>
```

or with text that is not shown (`styles/utilities.css`):

```html
<dd data-action>
    <a href="/plan">Change<span class="el-visually-hidden"> the plan</span></a>
</dd>
```

On a touch screen an `el-button` is at least `--el-touch-target` high and wide. A plain link is as large as its text.

## Lines and spacing

A row has `--el-space-3` above and below, and between names and values is `--el-space-4`. Above every row but the first is a line in `--el-color-border`, `--el-border-width` high, over the whole width of the list. Without a theme the list has no line; the spacing falls back to `0.75rem` and `1rem`.

Two properties set the spacing for a list, or for the page:

```css
el-description-list {
    --el-description-list-padding-block: 0.5rem;
    --el-description-list-gap: 2rem;
}
```

## A reset of the page

A rule of the page for a `<dt>` or a `<dd>` wins over what the list says for them, and a reset has such a rule for every element, and for what an element generates: `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; }` in Tailwind CSS v4. The list looks the same on a page with that reset and on one without:

- **The room of a row is the list's**: the gap between the rows of its grid, and its own padding above the first and below the last row. Where a name stands above its value, the value is moved up to its name with a position.
- **The gap between a name and its value** is a column of the grid, and the one in front of an action an empty box the action begins with.
- **The line between two rows** is a box with a height and a fill, placed with `translate`: no border, and no margin.

A reset may take the margin, the padding and the border of every element and of every `::before` and `::after`. A padding or a margin the page gives a `<dt>` or a `<dd>` itself adds to the room of the row.

What the list does set on the elements of the page, and what a rule of the page for the same property would change: their column (`grid-column`), the colour, the size and the line height of a name, how a long word breaks (`overflow-wrap`), the position of a value in a narrow list (`position`, `inset-block-start`), and for an action its layout (`display: flex`), its height and the `::before` in front of its content. The `::before` of a name is the line.

A list with nothing in it has no height. One whose rows are all hidden keeps the room above its first and below its last row.

A long value breaks, inside of a word where it has to (a token, an address): the list is never wider than its place.

The list has no surface. Put it into an `el-card` for one. The `hidden` attribute hides it.

## Accessibility

- The list is a `<dl>`, a name a `<dt>` and a value a `<dd>`: a screen reader announces a description list, and reads a value with its name.
- An action is a `<dd>` as well: it belongs to the name of its row.
- The line between two rows is drawn in the text colour of the system where the user forces colours.
- The list has no name of its own. Put a heading in front of it.

## Server-side rendering

The `<dl>` is part of the server-rendered markup (Declarative Shadow DOM), and the names and the values are what the page wrote. The list runs no script: it is laid out, narrow or wide, before its JavaScript has loaded, and looks the same after.

## What it is not

- No way to edit a value in place. An action leads to where the value is changed.
- No list of rows that are links as a whole: that is [`el-list`](../list/list.readme.md).

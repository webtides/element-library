# ListItem

`list-item` is one row of an [`el-list`](../list/list.readme.md). It has the parts a row has everywhere: something at the start, a title, a line under it, something at the end, and a control of its own after that. With `href` the row is a link as a whole.

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
<el-list label="Files">
    <el-list-item href="/files/notes.pdf">
        <el-svg-use slot="start" name="file"></el-svg-use>
        notes.pdf
        <span slot="description">240 KB</span>
        <el-badge slot="end" pill="true">3</el-badge>
        <el-button slot="action" size="small" appearance="plain" aria-label="Remove notes.pdf">✕</el-button>
    </el-list-item>
</el-list>
```

> Boolean attributes are passed as strings (`current="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | `''` | The address the row leads to. Unset, the row is no link. |
| `target` | `string` | `''` | Where to open the address (only with `href`). |
| `rel` | `string` | `'noreferrer noopener'` | `rel` attribute for the link, written when `target` is set. |
| `current` | `boolean` | `false` | The row is the current or the chosen one: it gets `aria-current`, a bar at its start and a heavier title. |
| `mark` | `string` | `''` | Marks the row with a dot in the padding at its start. The text is read in front of the title. Unset, the row has no mark. |
| `truncate` | `boolean` | `false` | Cuts the title and the line under it after one line, with an ellipsis. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name | Description |
| --- | --- |
| (default) | The title of the row. |
| `description` | The line under the title. |
| `start` | What stands in front of the texts: an icon, an avatar. |
| `end` | What stands at the end of the row and belongs to it: a value, a count, a chevron. In a row that is a link it is part of the target of the link. |
| `action` | A control at the very end: a button, a switch, a menu. In a row that is a link it lies on top of the link and is a target of its own. |

#### CSS Parts

| Name          | Description                                          |
| ------------- | ---------------------------------------------------- |
| `base`        | The row: an item of the list.                        |
| `mark`        | The dot of `mark`, in the padding at the start.      |
| `start`       | The region of the `start` slot.                      |
| `text`        | The title and the line under it.                     |
| `title`       | The title: an `<a>` with `href`, a `<span>` without. |
| `description` | The region of the `description` slot.                |
| `end`         | The region of the `end` slot.                        |
| `action`      | The region of the `action` slot.                     |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-list-padding-inline` | `--el-space-4` | The padding of the row at its start and its end. Set on the list, or for the page. Without a theme it is `1rem`. |

## A row that is a link

With `href` the title is a native link, and the target of that link is the whole row: the padding, the start, the texts and the end. A click anywhere on the row follows the link, and it is a real link there: the context menu, a middle click and "open in a new tab" work as on any link. The name of the link is the title alone; the line under it and the end are text beside it.

The link takes the keyboard focus once, and its focus ring is drawn around the row, inside of it.

On a touch screen (`@media (any-pointer: coarse)`) a row that is a link is at least `--el-touch-target` high.

## `end` and `action`

Both stand at the end of the row, `end` first.

- **`end`** is for what belongs to the row: a value, a count, a time, a chevron. In a row that is a link, a click on it follows the link.
- **`action`** is for a control: a button, a switch, a menu. It lies on top of the link and is a target of its own, with a place of its own in the tab order after the link.

A control belongs into `action`. In `end` it would lie under the link of the row, and a click on it would follow the link. In a row without `href` the two only differ in their order and their colour.

## The current row

`current` marks the row of the page the user is on, or the row that is chosen: the message that is open beside the list. A row with `href` gets `aria-current="page"` on its link, a row without gets `aria-current="true"`.

It is told apart by a tint of the text colour, by a bar at its start in the accent colour and by a heavier title. The bar and the weight do not depend on a colour: where the user forces colours, the bar is drawn in a colour of the system.

## A mark

`mark="Unread"` draws a dot in the padding at the start of the row, in the accent colour. It is out of the flow: a row with a mark has its start and its texts where a row without one has them. The text of the attribute is for assistive technology: it is read in front of the title, and it is part of the name of the link ("Unread Ada Lovelace"). Write it in the language of the page.

## Long texts

A title that is longer than the row breaks into more lines, and so does the line under it. A text without a space (an address, a word a user typed) breaks inside of the word: a row is never wider than its list. What is in `end` takes half of the row at most and breaks after that.

`truncate="true"` cuts the title and the line under it after one line, with an ellipsis. What is cut is not shown anywhere else; use it where the row leads to the whole text.

## Accessibility

- The row has `role="listitem"`. Use it in an `el-list`, which is the list.
- A row with `href` holds one link, named by the title. The texts beside it are read with the row.
- An icon or an avatar in `start` that only repeats the title should be hidden from assistive technology (`aria-hidden="true"`), or have a name that adds something.
- A control in `action` needs a name that says which row it acts on ("Remove notes.pdf"), because a screen reader user may reach it without the row.

## Server-side rendering

The row, its link and its parts are part of the server-rendered markup (Declarative Shadow DOM). The row runs no script: it looks the same before and after its JavaScript has loaded, and its link works before that.

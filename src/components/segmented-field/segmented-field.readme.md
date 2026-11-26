# SegmentedField

`segmented-field` is one choice of a few options, shown as a row of joined buttons: "List | Grid", "Day | Week | Month", the alignment of a text. It looks like an [`el-button-group`](../button-group/button-group.readme.md) and behaves like a group of radios, because it is one: it extends [`el-radio-field`](../radio-field/radio-field.readme.md) and renders a native `<fieldset>`/`<legend>` with an `<input type="radio">` per option. The one tab stop, the arrow keys, the value in the form, its reset and `required` are native.

It is headless by default: without a theme the options have a border and a text in the text colour of the page.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/segmented-field/define';
```

```html
<el-segmented-field
    name="view"
    label="Calendar"
    value="week"
    options='[{"value":"day","label":"Day"},{"value":"week","label":"Week"},{"value":"month","label":"Month"}]'
></el-segmented-field>

<el-segmented-field name="plan" label="Plan" required="true" options='["Free","Team","Company"]'></el-segmented-field>
```

The radios are one group by their `name`, as native radios are: give the field a name, and a name of its own on a page with several of them outside of a form.

#### The value

`value` is the value of the chosen option, which is what the form submits, and `null` while nothing is chosen. A choice cannot be taken back to none by the user: a radio group has no way to choose nothing. A script can, with `value = null`, and so can `form.reset()` for a field that was rendered without a choice.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `null` | The value of the chosen option. |
| `options` | `Array<string \| { value, label?, icon?, disabled? }>` | `[]` | The options, as `el-radio-field` has them: plain strings, or objects with a `value`, a `label` and `disabled`. `icon` shows an icon in the place of the label, see [Icons](#icons). |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | The size of the options: their height, their padding and their font size. Reflected to the `size` attribute. |

#### Events

| Name           | Detail               | Description                           |
| -------------- | -------------------- | ------------------------------------- |
| `input-change` | `string` (the value) | Fired when the chosen option changes. |

#### CSS States

| Name      | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `touched` | Set once the user has left the group. Moving from one option to the next does not set it. |
| `valid`   | Set while the field passes validation.                                                    |
| `invalid` | Set while the field fails validation (`required` with nothing chosen).                    |

#### CSS Custom Properties

Reads the design tokens of the library: `--el-color-border` for the border of an option, `--el-color-fg` for its text, `--el-radius-md` for the corners at the two ends of the row, `--el-control-height`, `--el-space-*` and `--el-font-size-*` for the size, `--el-color-accent` and `--el-focus-ring-width` for the focus ring.

## The row

The options are joined: two neighbours share one line, and only the corners at the two ends of the row are round. In a text that runs from right to left the row starts at the right, with its round corners there.

The row is as wide as its options. It is never wider than its place: the options share the width then, and a label that does not fit breaks into lines, with all options as high as the highest. A segmented field is for a few short options; for more of them, or longer ones, an `el-radio-field` or an `el-select-field` is the better field.

An option is as high as an `el-button` of the same `size`.

## The chosen option

The chosen option has a tint of its text colour and a ring inside of its edge, as a pressed `el-button` has. The ring is a shape and a border: it tells the option apart without a colour, and where the user forces colours it stays, a little wider.

All of it is the stylesheet reading the native radio (`:checked`): nothing is set from a script.

## Icons

An option with `icon` shows that icon in the place of its label. `icon` is the address of an SVG symbol: one of the page (`#grid`) or of a file (`/icons.svg#grid`). The label is then not shown. It is the name of the option for assistive technology, and its tooltip for the pointer.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="icon-list" viewBox="0 0 24 24">…</symbol>
    <symbol id="icon-grid" viewBox="0 0 24 24">…</symbol>
</svg>

<el-segmented-field
    name="layout"
    label="Layout"
    value="list"
    options='[{"value":"list","label":"List","icon":"#icon-list"},{"value":"grid","label":"Grid","icon":"#icon-grid"}]'
></el-segmented-field>
```

The icon has the colour of the text (`currentColor`) and is 1.25em wide and high. Every option needs a `label`, with an icon as well.

## In a toolbar

In an [`el-toolbar`](../toolbar/toolbar.readme.md) the field takes the size of the toolbar, while the page has not set `size` on the field itself. Give it `label-screen-reader-only="true"`: the label stays the name of the group and is not shown.

```html
<el-toolbar label="Tasks" size="small">
    <el-segmented-field
        name="view"
        label="View"
        label-screen-reader-only="true"
        value="List"
        options='["List","Board"]'
    ></el-segmented-field>
</el-toolbar>
```

The arrow keys of a toolbar move the focus from control to control, and the options of the field are controls of the toolbar. So there the left and right arrow keys go through the options without choosing: Space chooses the option with the focus, and the up and down arrow keys move the choice.

## Disabled

`disabled="true"` disables the whole field: nothing can be chosen, and the form leaves it out. An option with `disabled: true` cannot be chosen, and the arrow keys skip it. A disabled option is faded.

## Accessibility

- The field is a group (`<fieldset>`) named by its `label` (`<legend>`), and its options are native radios: a screen reader announces "radio button, 2 of 3" with the name of the option.
- It is one stop of the Tab key: the chosen option, or the first one while nothing is chosen. The arrow keys move the choice, around the ends, and Space chooses the option with the focus.
- The keyboard focus shows as a ring around the option, which lies over its neighbours while it has the focus.
- On a touch screen (`@media (any-pointer: coarse)`) an option is at least `--el-touch-target` high and wide.
- `label-screen-reader-only="true"` hides the label from the eye and keeps it as the name of the group, for a field in a toolbar. The field hides it with its own stylesheet; it needs no `sr-only` class of the page.

## Server-side rendering

The field renders into the page, with native radios. Server-rendered, it looks the same before and after the element takes over: the row, the sizes and the chosen option are its stylesheet. Before the script has run, a click and the arrow keys choose, the form submits the value, and `required` holds. The script adds the events, the messages of the field and the reset to what was rendered.

## What it is not

- **Not several options at once.** That is an [`el-checkbox-group-field`](../checkbox-group-field/checkbox-group-field.readme.md).
- **Not a row of buttons that each do something**, as in a toolbar. That is an [`el-button-group`](../button-group/button-group.readme.md).
- **Not a single button that stays pressed.** That is an `el-button` with [`toggle`](../button/button.readme.md#a-toggle-button).

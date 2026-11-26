# Toolbar

`toolbar` is the row of controls over a list or a view: reply, archive, a toggle, a choice of the layout. It gives its controls one size and one appearance, lays them out with a gap and a group at the end, and makes them one stop of the Tab key, with the arrow keys between them.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/toolbar/define';
import '@webtides/element-library/button/define';
import '@webtides/element-library/divider/define';
```

```html
<el-toolbar label="Message" size="small">
    <el-button circle="true" aria-label="Reply"><svg aria-hidden="true">…</svg></el-button>
    <el-button circle="true" aria-label="Forward"><svg aria-hidden="true">…</svg></el-button>
    <el-divider orientation="vertical"></el-divider>
    <el-button toggle="true" circle="true" aria-label="Starred"><svg aria-hidden="true">…</svg></el-button>
    <el-segmented-field
        name="view"
        label="View"
        label-screen-reader-only="true"
        value="list"
        options='[{"value":"list","label":"List"},{"value":"board","label":"Board"}]'
    ></el-segmented-field>
    <el-button slot="end" variant="brand" appearance="filled">Send</el-button>
</el-toolbar>
```

> Boolean attributes are passed as strings (`circle="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `''` | The name of the toolbar for assistive technology. Unset, the toolbar has none. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | The size of the controls that have none of their own. Reflected to the `size` attribute. |
| `appearance` | `'filled' \| 'outlined' \| 'plain'` | `'plain'` | The appearance of the buttons that have none of their own. Reflected to the `appearance` attribute. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| (default) | The controls of the toolbar, and `el-divider` elements between two groups. |
| `end`     | The controls at the end of the toolbar.                                    |

#### CSS Parts

| Name      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `base`    | The toolbar (`role="toolbar"`): the row of the controls.     |
| `end`     | The group at the end.                                        |
| `tooltip` | The tooltip of a button with an icon alone: an `el-tooltip`. |

#### CSS Custom Properties

Reads `--el-space-2` for the gap between two controls (`0.5rem` without a theme). The controls read the tokens they read anywhere.

## One size and one appearance

`size` and `appearance` of the toolbar are the size and the appearance of its controls: of every `el-button` in it, also inside of an `el-button-group` or as the anchor of an `el-popover`, and `size` of an `el-segmented-field` as well. A toolbar without the attributes has controls of the medium size and plain buttons.

A control that names its own keeps it. That goes for the defaults as well: `appearance="filled"` on a button keeps the button filled in a plain toolbar, and `size="medium"` keeps it medium in a small one.

```html
<el-toolbar label="Message" size="small">
    <el-button>Reply</el-button>
    <!-- small, plain -->
    <el-button variant="brand" appearance="filled">Send</el-button>
    <!-- small, filled -->
</el-toolbar>
```

How it works, and what follows from it:

- The toolbar does not write to its controls. It says its size and its appearance in CSS properties that are inherited, and a control reads them in its own stylesheet. The `size` and the `appearance` attribute of a button in a toolbar still say `medium` and `filled`, the defaults: a selector like `el-button[appearance='plain']` does not match it.
- A control counts as having its own when the page wrote the attribute, when a script set the property before the control was connected, or when either changes later. Setting a property to the value it already has changes nothing: to keep a default after the control is connected, write the attribute.
- A plain button of a toolbar answers to the pointer with a tint of its text colour, as an outlined button does. A button with `appearance="plain"` of its own is underlined under the pointer, as outside of a toolbar.
- Other controls of the library keep their own size in a toolbar.

## Groups

- An `el-divider` with `orientation="vertical"` stands between two groups of controls. It is a separator to assistive technology, and the arrow keys pass it.
- An [`el-button-group`](../button-group/button-group.readme.md) is a group of buttons that touch, with a name of its own.
- What is slotted into `end` stands at the end of the toolbar: all the room that is left is in front of it.

Start and end follow the reading direction: in a text that runs from right to left the first control is at the right, and the group at the end at the left.

## A button with an icon alone

Such a button is an `el-button` with `circle="true"`, which makes it as wide as it is high, and an `aria-label`, which is its name.

```html
<el-button circle="true" aria-label="Archive"><svg aria-hidden="true">…</svg></el-button>
```

The toolbar shows that name as a tooltip, for the pointer and for the focus of the keyboard: every `el-button` with an `aria-label` in the toolbar gets one, below the button. The tooltip is for the eye. A screen reader has the name already and does not read it twice.

The tooltips come with the script of the toolbar. They are `el-tooltip` elements in its shadow root (`::part(tooltip)`), so nothing is added to what the page wrote into the toolbar. The toolbar imports the tooltip, and with it `@floating-ui/dom`.

## More controls than the width takes

The toolbar breaks into a second line where its controls do not fit into one. Every control stays in reach of the pointer and of the arrow keys, and the toolbar is never wider than its place. The group at the end still ends the toolbar, in a line of its own if it has to.

## Keyboard

The toolbar is one stop of the Tab key, as the WAI-ARIA toolbar pattern says.

| Key | What it does |
| --- | --- |
| Tab | Moves the focus into the toolbar: to the control that had it last, or to the first one. From inside, it leaves the toolbar. |
| Right arrow, left arrow | Moves the focus to the next and the previous control, and around the ends. The other way round in a text that runs from right to left. |
| Home, End | Moves the focus to the first and the last control. |

- Disabled controls are passed.
- The options of an `el-segmented-field` are controls of the toolbar: the left and right arrow keys go through them without choosing. Space chooses the option with the focus, and the up and down arrow keys move the choice, as in a group of radios outside of a toolbar.
- In a control that takes text (an input, a select) the arrow keys, Home and End belong to that control. The Tab key leaves the toolbar from there as well.
- A click puts the focus where the pointer is.

Before the script has run, every control is a stop of the Tab key.

## Accessibility

- The toolbar has `role="toolbar"`. Give it a `label`: a screen reader reads it when its user enters the toolbar, and a page with two toolbars needs it to tell them apart.
- Use a toolbar for three controls or more. Two buttons beside each other need none.
- On a touch screen (`@media (any-pointer: coarse)`) every `el-button` and every option of an `el-segmented-field` is at least `--el-touch-target` high and wide, in a small toolbar as well.
- An `el-segmented-field` in a toolbar needs a `label` as every field does. `label-screen-reader-only="true"` keeps it as the name of the group and does not show it.

## Server-side rendering

The toolbar, its name and its layout are part of the server-rendered markup (Declarative Shadow DOM), and the size and the appearance of the controls are their stylesheets reading the toolbar. A server-rendered toolbar looks the same before and after the elements take over. The script adds the keyboard and the tooltips.

The `hidden` attribute hides the toolbar.

## What it is not

- No toolbar the user arranges, and no formatting toolbar of an editor for rich text.
- No menu for the controls that do not fit: they go into a second line.

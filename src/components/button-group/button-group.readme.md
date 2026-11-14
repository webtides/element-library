# Button Group

`button-group` joins a row of [`el-button`](../button/button.readme.md) into one control: the actions of a toolbar, a button with a second one for more options, the steps back and forward. The buttons touch, only the outer corners of the row are rounded, and a line divides two neighbours.

To assistive technology it is a group with a name. Every button stays a button of its own.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/button-group/define';
import '@webtides/element-library/button/define';
```

```html
<el-button-group label="Text alignment">
    <el-button>Left</el-button>
    <el-button>Centre</el-button>
    <el-button>Right</el-button>
</el-button-group>
```

## API

#### Properties/Attributes

| Name    | Type     | Default | Description                                                     |
| ------- | -------- | ------- | --------------------------------------------------------------- |
| `label` | `string` | `''`    | The accessible name of the group. Unset, the group has no name. |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| (default) | The buttons: `el-button` elements, or elements that hold one (see below). |

#### CSS Parts

| Name   | Description                                         |
| ------ | --------------------------------------------------- |
| `base` | The row. It carries `role="group"` and the `label`. |

#### CSS Custom Properties

_None._ The group takes the radius and the border width from the tokens of the theme, through its buttons.

## What the group does

- The buttons stand in one row and touch. A button lies on the border of the one in front of it, so two neighbours share one line.
- The corners that face a neighbour are square. The outer corners of the row keep the radius of the buttons, the one of the theme or the one of a `pill`. In a text that runs from right to left the row is mirrored.
- Two filled buttons are divided by a line: the border at the start of the second one, in a quarter of its text colour on its fill. That shows between two fills of one colour. Outlined buttons share their border, plain buttons have none.
- The button that has the focus lies over its neighbours, so its focus ring is not covered.

The group does this with its stylesheet alone. It runs no script on its buttons and writes nothing onto them: a button that is added, moved or taken away is joined at once, and a server-rendered group does not change when the elements take over.

## What the buttons bring

`variant`, `appearance`, `size`, `pill` and `disabled` stay with every button. The group does not pass anything on. Give every button of a group the same `size`; a mix of appearances works, a mix of sizes does not line up.

The group does not keep a selection either. For buttons of which one is on, set `aria-pressed` on every button and change it, and the appearance of the button that is on, when one is pressed:

```html
<el-button-group label="Text alignment">
    <el-button appearance="outlined" aria-pressed="false">Left</el-button>
    <el-button variant="brand" aria-pressed="true">Centre</el-button>
    <el-button appearance="outlined" aria-pressed="false">Right</el-button>
</el-button-group>
```

## A button inside of another element

What decides whether a side is joined is the place of the element that is slotted into the group. A button inside of that element is joined as the element is. That is how a button with more options is built, with an `el-popover` as the last element of the group:

```html
<el-button-group label="Save">
    <el-button variant="brand">Save</el-button>
    <el-popover placement="bottom-end">
        <el-button slot="anchor" variant="brand" caret="true" aria-label="More ways to save"></el-button>
        <el-button appearance="plain">Save as a copy</el-button>
    </el-popover>
</el-button-group>
```

The panel of the popover is not part of the row: a button in it has all of its corners.

Every element in the group counts as a place in the row, whether it shows or not. An `el-tooltip` for a button of the group belongs after the group, not into it: as the last element of the group it would take the rounded end from the last button.

The `hidden` attribute hides the group.

## Accessibility

- The row is a group (`role="group"`), named by `label`. A screen reader announces the name when its user moves into the group: "Text alignment, group". Without a `label` the group has no name, and most screen readers pass over it; the buttons are announced as before.
- Every button stays a tab stop of its own, in the order of the row. The group adds no keys.
- A button that shows an icon only needs a name of its own (`aria-label` on the `el-button`), in a group as anywhere else.
- When colours are forced (the contrast themes of Windows) every button has its full border, in the colour of the system.

## Server-side rendering

The group, its role and its name are part of the server-rendered markup (Declarative Shadow DOM), and the row is joined by the stylesheets of the group and the buttons. Nothing changes when the elements take over.

# Progress Ring

`progress-ring` shows how far a task is where there is little room: a tile of a dashboard, a card, the side of a heading. A ring closes with `value` of `max`, clockwise from the top, and its middle has room for a short text.

It speaks the vocabulary of `el-progress-bar`: `value`, `max` and `label`. A wait of unknown length is `el-spinner`.

Without a theme imported the ring takes both of its colours from the text colour, so it shows on any background. With a theme the part that is drawn has the accent colour.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/progress-ring/define';
```

```html
<el-progress-ring value="45" label="Storage"></el-progress-ring>

<!-- With the figure in the middle -->
<el-progress-ring value="45" label="Storage">45 %</el-progress-ring>

<!-- In the unit of the task: 3 of 12 files -->
<el-progress-ring value="3" max="12" label="Files">3 / 12</el-progress-ring>
```

## API

#### Properties/Attributes

| Name    | Type     | Default      | Description                             |
| ------- | -------- | ------------ | --------------------------------------- |
| `value` | `number` | `0`          | How far the task is, from `0` to `max`. |
| `max`   | `number` | `100`        | The value of a task that is done.       |
| `label` | `string` | `'Progress'` | The accessible name of the ring.        |

#### Methods

_None._

#### Events

_None._

#### Slots

| Name      | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| (default) | A short text in the middle of the ring. Not read out by a screen reader. |

#### CSS Parts

| Name        | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| `base`      | The ring and its middle. It carries `role="progressbar"`, the value and the label. |
| `track`     | The whole ring, a `<circle>`.                                                      |
| `indicator` | The part of the ring that is drawn, a `<circle>`.                                  |
| `label`     | The middle of the ring, around the slot.                                           |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-progress-ring-size` | `4rem` | The width and the height of the ring. |
| `--el-progress-ring-track-width` | `0.25rem` | The thickness of the ring. |
| `--el-progress-ring-indicator-color` | `--el-color-accent`, the text colour without a theme | The part that is drawn. |
| `--el-progress-ring-track-color` | a fifth of the text colour | The whole ring. |

## Value

`value` of `max` is the share of the ring that is drawn. `max` is `100` by default, so a `value` is a percentage. With another `max` both count in the unit of the task: `value="3" max="12"` for the third of twelve files.

A value outside of the range is shown as the nearest one inside: below `0` nothing is drawn, above `max` the ring is closed. A `value` that is no number counts as `0`, a `max` that is no number above zero as `100`. The properties are left as they were set.

The ring starts at the top and runs clockwise, in a text that runs from right to left as well. It moves to a new value in the duration of the theme (`--el-duration-md`), and at once without a theme.

There is no `indeterminate`. A ring that turns without a value is `el-spinner`.

## The middle

What is slotted into the element stands in the middle of the ring, over it. The ring does not grow with it: keep the text to a few characters, "45 %" or "3 / 12", and set a font size on the element that fits the ring.

The figures have one width (`tabular-nums`), so the text does not move while the value counts up.

The ring does not write the value into its middle by itself. What is shown there, a percentage, a count, an icon when the task is done, is for the page to say.

## Size and colours

The ring is a square of `--el-progress-ring-size`, `4rem` by default. `--el-progress-ring-track-width` is the thickness of the line, which lies inside of that square. In a line of text the ring stands on the middle of the line.

The part that is drawn reads `--el-progress-ring-indicator-color`, then `--el-color-accent`, then the text colour. The whole ring reads `--el-progress-ring-track-color`; unset, it is the text colour at a fifth of its strength.

There is no `variant`. To say that a task went well or failed, set the colour of the indicator (`--el-color-success`, `--el-color-danger`) and say it in a text as well: a colour alone does not reach everyone.

The end of the line is cut straight. For a round end: `el-progress-ring::part(indicator) { stroke-linecap: round; }`.

The `hidden` attribute hides the ring.

## Accessibility

- The ring is a progress bar to assistive technology (`role="progressbar"`) with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`, from which a screen reader computes the percentage.
- Its name is the `label`, "Progress" by default. Set `label` to say what is in progress, in the language of the page; two rings on a page need two names.
- The text in the middle is not read out: the content of a progress bar is presentation, and the value says the same. A text that says more than the value belongs next to the ring.
- A screen reader announces a new value when its user is on the ring, not on its own. To tell that a task is done, write the message into a live region of the page, or show a toast.
- When colours are forced (the contrast themes of Windows) the whole ring is a thin line in the text colour and the part that is drawn keeps its width, in the colour of a selection.

## Server-side rendering

The ring, its role, its value and the share that is drawn are part of the server-rendered markup (Declarative Shadow DOM), so the ring shows its value before its JavaScript has loaded, and without JavaScript.

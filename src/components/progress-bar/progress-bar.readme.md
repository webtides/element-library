# Progress Bar

`progress-bar` shows how far a task is: an upload, an import, the steps of a form. A track fills with `value` of `max`. With `indeterminate` it is the bar for a task whose progress is not known yet.

Without a theme imported the bar takes both of its colours from the text colour, so it shows on any background. With a theme the part that is filled has the accent colour.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/progress-bar/define';
```

```html
<el-progress-bar value="40" label="Upload"></el-progress-bar>

<!-- In the unit of the task: 3 of 12 files -->
<el-progress-bar value="3" max="12" label="Files"></el-progress-bar>

<!-- The progress is not known yet -->
<el-progress-bar indeterminate="true" label="Import"></el-progress-bar>
```

> Boolean attributes are passed as strings (`indeterminate="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | How far the task is, from `0` to `max`. |
| `max` | `number` | `100` | The value of a task that is done. |
| `indeterminate` | `boolean` | `false` | The progress is not known: the bar has no value, a part of the track moves. |
| `label` | `string` | `'Progress'` | The accessible name of the bar. |

#### Methods

_None._

#### Events

_None._

#### Slots

_None._

#### CSS Parts

| Name        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `base`      | The track. It carries `role="progressbar"`, the value and the label.     |
| `indicator` | The part of the track that is filled, or that moves with no value known. |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-progress-bar-height` | `0.5rem` | The height of the bar. |
| `--el-progress-bar-indicator-color` | `--el-color-accent`, the text colour without a theme | The part that is filled. |
| `--el-progress-bar-track-color` | a fifth of the text colour | The track. |

## Value

`value` of `max` is the share of the track that is filled. `max` is `100` by default, so a `value` is a percentage. With another `max` both count in the unit of the task: `value="3" max="12"` for the third of twelve files.

A value outside of the range is shown as the nearest one inside: below `0` the track is empty, above `max` it is full. A `value` that is no number counts as `0`, a `max` that is no number above zero as `100`. The properties are left as they were set.

The part that is filled starts where the text starts: at the left, and at the right in a text that runs from right to left. It moves to a new value in the duration of the theme (`--el-duration-md`), and at once without a theme.

The bar has no text of its own. Write what the task is, and how far it is, next to the bar.

## Indeterminate

`indeterminate` is for a task that has started and cannot say yet how far it is: a part of the track passes over it, again and again. When the progress is known, set `indeterminate` to `false` and the bar shows `value`, in the same place and at the same size.

For a wait that never gets a value, a page or a section that loads, `el-spinner` is the smaller sign.

For a user who prefers reduced motion (`prefers-reduced-motion: reduce`) nothing crosses the page: the whole track fades and comes back instead. It does not stand still, since a full bar that does not move reads as a task that is done.

## Size and colours

The bar is as wide as its container; give the element a width or a `max-width` for another one. `--el-progress-bar-height` is its height, `0.5rem` by default.

The part that is filled reads `--el-progress-bar-indicator-color`, then `--el-color-accent`, then the text colour. The track reads `--el-progress-bar-track-color`; unset, it is the text colour at a fifth of its strength.

There is no `variant`. To say that a task went well or failed, set the colour of the indicator (`--el-color-success`, `--el-color-danger`) and say it in the text next to the bar as well: a colour alone does not reach everyone.

The ends have the radius of the theme (`--el-radius-md`). For fully rounded ends on a higher bar: `el-progress-bar::part(base) { border-radius: 999px; }`.

The `hidden` attribute hides the bar.

## Accessibility

- The track is a progress bar to assistive technology (`role="progressbar"`) with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`, from which a screen reader computes the percentage. While `indeterminate` it has no `aria-valuenow`, which is how a progress of unknown length is exposed.
- Its name is the `label`, "Progress" by default. Set `label` to say what is in progress, in the language of the page; two bars on a page need two names.
- A screen reader announces a new value when its user is on the bar, not on its own. To tell that a task is done, write the message into a live region of the page, or show a toast. Set `aria-busy="true"` on the region that is being loaded.
- When colours are forced (the contrast themes of Windows) the track is drawn with a border and filled in the colour of a selection.

## Server-side rendering

The track, its role, its value and the width of what is filled are part of the server-rendered markup (Declarative Shadow DOM), so the bar shows its value before its JavaScript has loaded, and without JavaScript.

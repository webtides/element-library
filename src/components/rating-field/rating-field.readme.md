# RatingField

`rating-field` takes a rating as a number from 1 to `max`, drawn as a row of stars: the stars up to the chosen one are filled. It renders a native `<fieldset>`/`<legend>` wrapping one `<input type="radio">` per step, so grouping, arrow-key navigation and form submission are all native. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is headless by default: without a theme the stars have the colour of the text.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/rating-field/define';
```

```html
<el-rating-field name="rating" label="How was your stay?"></el-rating-field>

<el-rating-field name="score" label="Score" max="10" value="7" required="true"></el-rating-field>
```

The radios are one group by their `name`, as native radios are: give the field a name, and a name of its own on a page with several ratings outside of a form.

#### The value

`value` is the chosen step as text (`"3"`), which is what the form submits, and `null` while nothing is chosen. A value that is no step of the scale, such as `"2.5"` or a `"9"` with five stars, chooses nothing.

A rating cannot be taken back to none by the user: a radio group has no way to choose nothing. A script can, with `value = null`, and so can `form.reset()` for a field that was rendered without a rating.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name    | Type     | Default | Description                                                 |
| ------- | -------- | ------- | ----------------------------------------------------------- |
| `value` | `string` | `null`  | The chosen step, as the text the form submits.              |
| `max`   | `number` | `5`     | The number of stars. The steps of the scale are 1 to `max`. |

#### Events

| Name           | Detail               | Description                    |
| -------------- | -------------------- | ------------------------------ |
| `input-change` | `string` (the value) | Fired when the rating changes. |

#### CSS States

| Name      | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `touched` | Set once the user has left the group. Moving from one star to the next does not set it. |
| `valid`   | Set while the field passes validation.                                                  |
| `invalid` | Set while the field fails validation (`required` with nothing chosen).                  |

#### CSS Custom Properties

| Name                | Description                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `--el-rating-color` | The colour of a filled star. Unset, it is `--el-color-accent`.                            |
| `--el-rating-size`  | The width and the height of a star. Unset, it is `--el-space-5`, `1.5em` without a theme. |

Headless by default; reads the library's `--el-*` design tokens (`--el-color-accent`, `--el-color-fg-muted`, `--el-space-1`, `--el-space-5`, `--el-focus-ring-width`, `--el-duration-md`, `--el-ease`, `--el-color-fg`, `--el-color-danger`, `--el-font-size-sm`). Skin it via a theme — see the Storybook _Docs / Theming_ page.

A star that is not on is an outline in `--el-color-fg-muted`, a star that is on is filled: the two differ in their shape, not in their colour alone. With a mouse, the stars up to the one under the pointer are shown as on before the click.

The label, the help message, the stars and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) every star, with its label as the hit area, is at least `--el-touch-target` wide and high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- Uses a native `<fieldset>` + `<legend>`, so the group is announced with its label, and native radios: Tab moves into the group, the arrow keys choose a star.
- Every radio is named by its number (`aria-label`), which needs no translation, and a screen reader adds its place in the group. Say what the ends of the scale mean in the label or in the help message.
- The native radio stays in the accessibility tree and focusable; it is only hidden visually, with keyboard focus reflected onto its star via `:focus-visible`. The star is hidden from assistive technology (`aria-hidden`).
- The group and each of its radios name the help message in `aria-describedby`, and the error message while that is shown. The group says whether it is valid (`aria-invalid`).
- Validation messages surface only once the group is `touched`. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.
- The field takes a rating. To show one that cannot be changed, such as an average, use an image with a text.

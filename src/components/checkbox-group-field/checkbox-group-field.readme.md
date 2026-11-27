# CheckboxGroupField

`checkbox-group-field` is a choice of any number of options: the topics of a newsletter, the days of a week. It renders a native `<fieldset>`/`<legend>` wrapping one `<input type="checkbox">` per option, all under one name, so the grouping, the keyboard and the form submission are native, with a custom box on top. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is the group of checkboxes that `radio-field` is for radios. For a single checkbox, such as "I agree to the terms", there is `checkbox-field`.

It is headless by default: without a theme the box falls back to a `currentColor` outline.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/checkbox-group-field/define';
```

```html
<el-checkbox-group-field
    name="topics"
    label="Topics"
    options='["News", "Offers", "Events"]'
    value='["News"]'
    required="true"
    error-message="Pick at least one topic."
></el-checkbox-group-field>
```

Options may be plain strings or objects with separate `value` / `label` and an optional per-option `disabled` flag:

```js
field.options = [
    { value: 'tue', label: 'Tuesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'sat', label: 'Saturday (no delivery)', disabled: true }
];
```

#### A colour or an icon in front of the label

Tags with a colour, calendars, categories with an icon: things a user knows by their colour are found by it where they are chosen. An option can name a `color`, which is drawn as a dot in front of its label, and an `icon`, the address of an SVG symbol, which is drawn there as well:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="icon-archive" viewBox="0 0 24 24">…</symbol>
</svg>

<el-checkbox-group-field
    name="tags"
    label="Tags"
    options='[{"value":"work","label":"Work","color":"#c81e1e"},{"value":"home","label":"Home","color":"#1e5fc8"},{"value":"archive","label":"Archive","icon":"#icon-archive"}]'
></el-checkbox-group-field>
```

- **`color`** is any colour of CSS. The dot has it where the user forces colours as well: it is the colour of a thing of the page, as the colour of a picture is.
- **`icon`** is the address of an SVG symbol: one of the page (`#icon-archive`) or of a file (`/icons.svg#archive`), as an option of [`el-segmented-field`](../segmented-field/segmented-field.readme.md) has it. The icon has the colour of the text and is 1.25em wide and high. An option with both shows the dot first.
- **Both are decorations.** They are hidden from assistive technology, and the label stays the name of the option: say in the label what the colour says to the eye.
- **As an attribute and as a property**, and in server-rendered markup: they are part of the option, as its label is.
- An option that names neither has nothing in front of its label, and a click on the dot or on the icon checks the option, as a click on its label does.

#### The value

`value` is the list of the checked values, in the order of the options. From a script it is an array; as an attribute it is JSON (`value='["tue", "thu"]'`). A new list checks and unchecks the options.

In a form every checked option is submitted under the `name` of the field: read them with `formData.getAll('topics')`.

#### Required

`required` means at least one checked option. A native checkbox knows no such rule, so the field carries it: while nothing is checked the field is not valid, and the browser refuses to submit the form, focuses the first checkbox and shows its bubble there. The text of the bubble is the `errorMessage` of the field, and "Select at least one option." without one.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` | `[]` | The values of the checked options, in the order of the options. As an attribute it is JSON. |
| `options` | `Array<string \| { value: string, label?: string, disabled?: boolean, color?: string, icon?: string }>` | `[]` | Options to render. Strings are used as both value and label; objects allow a separate label/disabled, and a `color` or an `icon` in front of the label. |
| `required` | `boolean` | `false` | Whether at least one option has to be checked. |

#### Events

| Name           | Detail                          | Description                            |
| -------------- | ------------------------------- | -------------------------------------- |
| `input-change` | `string[]` (the checked values) | Fired when the checked options change. |

#### CSS States

| Name | Description |
| --- | --- |
| `touched` | Set once the user has left the group. Moving from one checkbox to the next inside the group does not set it. |
| `valid` | Set while the group passes validation. |
| `invalid` | Set while the group fails validation (`required` with nothing checked). |

#### CSS Custom Properties

Headless by default; reads the library's `--el-*` design tokens (`--el-color-accent`, `--el-color-border`, `--el-color-bg`, `--el-radius-sm`, `--el-space-*`, `--el-border-width`, `--el-focus-ring-width`, `--el-duration-md`, `--el-ease`, `--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`). The box has the look of the box of `checkbox-field`. Skin it via a theme — see the Storybook _Docs / Theming_ page.

The label, the help message, the options and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the label of every option, which is its hit area, is at least `--el-touch-target` wide and high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- Uses a native `<fieldset>` + `<legend>`, so the group is announced with its label. Every option is a native checkbox: Tab moves from one to the next, Space checks.
- The native checkbox stays in the accessibility tree and focusable; it is only hidden visually, with keyboard focus reflected onto the custom box via `:focus-visible`.
- The box with its check mark is hidden from assistive technology (`aria-hidden`): the name of a checkbox is its label alone, and the checkbox itself says whether it is checked.
- The group and each of its checkboxes name the help message in `aria-describedby`, and the error message while that is shown.
- The group says whether it is valid (`aria-invalid`). There is no way to mark a group of checkboxes as required for a screen reader: say it in the label or in the help message.
- Validation messages surface only once the group is `touched`. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

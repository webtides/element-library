# RadioField

`radio-field` is a single-choice radio group. It renders a native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s — so grouping, arrow-key navigation and form submission are all native — with a custom indicator on top. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is headless by default: without a theme the indicator falls back to a `currentColor` outline.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/radio-field/define';
```

```html
<el-radio-field name="plan" label="Choose a plan" required="true"></el-radio-field>

<script>
    document.querySelector('el-radio-field').options = ['Starter', 'Pro', 'Enterprise'];
</script>
```

Options may be plain strings or objects with separate `value` / `label` and an optional per-option `disabled` flag:

```js
field.options = [
    { value: 'standard', label: 'Standard (free)' },
    { value: 'priority', label: 'Priority' },
    { value: 'dedicated', label: 'Dedicated (sold out)', disabled: true }
];
```

#### A colour or an icon in front of the label

Tags with a colour, calendars, categories with an icon: things a user knows by their colour are found by it where they are chosen. An option can name a `color`, which is drawn as a dot in front of its label, and an `icon`, the address of an SVG symbol, which is drawn there as well:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="icon-archive" viewBox="0 0 24 24">…</symbol>
</svg>

<el-radio-field
    name="tags"
    label="Calendar"
    options='[{"value":"work","label":"Work","color":"#c81e1e"},{"value":"home","label":"Home","color":"#1e5fc8"},{"value":"archive","label":"Archive","icon":"#icon-archive"}]'
></el-radio-field>
```

- **`color`** is any colour of CSS. The dot has it where the user forces colours as well: it is the colour of a thing of the page, as the colour of a picture is.
- **`icon`** is the address of an SVG symbol: one of the page (`#icon-archive`) or of a file (`/icons.svg#archive`), as an option of [`el-segmented-field`](../segmented-field/segmented-field.readme.md) has it. The icon has the colour of the text and is 1.25em wide and high. An option with both shows the dot first.
- **Both are decorations.** They are hidden from assistive technology, and the label stays the name of the option: say in the label what the colour says to the eye.
- **As an attribute and as a property**, and in server-rendered markup: they are part of the option, as its label is.
- An option that names neither has nothing in front of its label, and a click on the dot or on the icon checks the option, as a click on its label does.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| null` | `null` | The selected option's value. |
| `options` | `Array<string \| { value: string, label?: string, disabled?: boolean, color?: string, icon?: string }>` | `[]` | Options to render. Strings are used as both value and label; objects allow a separate label/disabled, and a `color` or an `icon` in front of the label. |

#### Events

| Name           | Detail               | Description                            |
| -------------- | -------------------- | -------------------------------------- |
| `input-change` | `string` (the value) | Fired when the selected value changes. |

#### CSS States

| Name      | Description                                                                              |
| --------- | ---------------------------------------------------------------------------------------- |
| `touched` | Set once the user has left the group. Moving from one radio to the next does not set it. |
| `valid`   | Set while the group passes validation.                                                   |
| `invalid` | Set while the group fails validation (e.g. `required` with no selection).                |

#### CSS Custom Properties

Headless by default; reads the library's `--el-*` design tokens (`--el-color-accent`, `--el-color-border`, `--el-color-bg`, `--el-space-*`, `--el-border-width`, `--el-focus-ring-width`, `--el-duration-md`, `--el-ease`, `--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`). Skin it via a theme — see the Storybook _Docs / Theming_ page.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the label of every option, which is its hit area, is at least `--el-touch-target` wide and high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- Uses a native `<fieldset>` + `<legend>`, so the group is announced with its label and radios are mutually exclusive with native arrow-key navigation.
- The native radio stays in the accessibility tree and focusable; it is only hidden visually, with keyboard focus reflected onto the custom indicator via `:focus-visible`.
- Validation messages surface only once the group is `touched`: once the user has left it, or the page has rendered it as not valid.
- The error message is an alert (`role="alert"`) and part of the `aria-describedby` of the group while it is shown: a screen reader announces it when it appears and reads it again when the group gets focus.

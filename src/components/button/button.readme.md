# Button

`button` is a themeable button. It renders a native `<button>` — or an `<a>` when `href` is set — and decorates it with the library's `--el-*` design tokens. It speaks the library's shared vocabulary: a semantic `variant`, an `appearance` and a `size`. It also supports pill / circle shapes, prefix & suffix icon slots, an optional dropdown caret and a loading spinner.

Without a theme imported the button stays close to a plain native control (muted surface, no decoration); import a theme to skin it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/button/define';
```

```html
<el-button variant="brand">Save changes</el-button>

<!-- Outlined, or as text only -->
<el-button variant="danger" appearance="outlined">Delete</el-button>
<el-button variant="brand" appearance="plain">Learn more</el-button>

<!-- As a link -->
<el-button href="/docs" target="_blank">Read the docs</el-button>

<!-- With icons in the prefix / suffix slots -->
<el-button variant="brand">
    <el-svg-use slot="prefix" name="icon-user" spritePath=""></el-svg-use>
    Account
</el-button>
```

> Boolean attributes are passed as strings (`disabled="true"`), matching the rest of the library's form components.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'neutral'` | `neutral`, `brand`, `success`, `warning` or `danger`. Picks the colours. Reflected. |
| `appearance` | `string` | `'filled'` | `filled`, `outlined` or `plain`. How the colours of the variant are painted. Reflected. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`. Reflected. |
| `pill` | `boolean` | `false` | Fully rounded ends. |
| `circle` | `boolean` | `false` | Square, fully-rounded icon button (use with a single icon). |
| `caret` | `boolean` | `false` | Appends a dropdown caret after the label. |
| `loading` | `boolean` | `false` | Shows a spinner and blocks interaction. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `type` | `string` | `'button'` | `button`, `submit` or `reset`. `submit` / `reset` act on the nearest `<form>`. Button-only. |
| `name` | `string` | `''` | Name submitted with the owning form. Button-only. |
| `value` | `string` | `''` | Value submitted with the owning form. Button-only. |
| `href` | `string` | `''` | When set, the button renders as a link to this URL. |
| `target` | `string` | `''` | Where to open the linked URL. Link-only. |
| `rel` | `string` | `'noreferrer noopener'` | `rel` for the link (only emitted alongside `target`). Link-only. |
| `download` | `string` | `''` | Tells the browser to download the linked URL. Link-only. |

#### Methods

| Name              | Description                                  |
| ----------------- | -------------------------------------------- |
| `focus(options?)` | Focuses the underlying control.              |
| `blur()`          | Removes focus from the underlying control.   |
| `click()`         | Simulates a click on the underlying control. |

#### Events

_None custom — native `click`, `focus` and `blur` behave as usual._

#### Slots

| Name        | Description                                      |
| ----------- | ------------------------------------------------ |
| _(default)_ | The button's label.                              |
| `prefix`    | A presentational prefix icon or similar element. |
| `suffix`    | A presentational suffix icon or similar element. |

#### CSS Parts

| Name      | Description                                         |
| --------- | --------------------------------------------------- |
| `base`    | The internal `<button>` / `<a>`.                    |
| `prefix`  | Container wrapping the `prefix` slot.               |
| `label`   | The default-slot label wrapper.                     |
| `suffix`  | Container wrapping the `suffix` slot.               |
| `caret`   | The dropdown caret (present only while `caret`).    |
| `spinner` | The loading spinner (present only while `loading`). |

#### CSS Custom Properties

Reads the standard library design tokens (`--el-color-accent`, `--el-color-bg`, `--el-color-border`, `--el-control-height`, `--el-radius-md`, `--el-space-*`, `--el-font-*`, `--el-focus-ring-*`, …). Skin the button by setting these at the document level via a theme.

Each variant reads one colour: `--el-color-accent` (`brand`), `--el-color-success`, `--el-color-warning` and `--el-color-danger`. `neutral` reads the surface tokens: `--el-color-bg-muted` for the fill, `--el-color-border` for the border and `--el-color-fg` for the text. The label on a brand, success or danger fill is `--el-color-bg`; a warning fill carries dark text, because a warning colour stays light in both colour schemes.

On a touch screen (`@media (any-pointer: coarse)`) the button is at least `--el-touch-target` wide and high, in every size and shape; a `circle` stays round. Without that token, and on a fine pointer, the sizes stay as they are.

A pressed button (`:active`) is darker than a hovered one; an `outlined` or `plain` button gets a tint of its text color instead. The hover styles only apply where the pointer can hover (`@media (hover: hover)`), so none stays behind after a tap on a touch screen.

The label of an `outlined` or `plain` `warning` button is `--el-color-warning` mixed half and half with `--el-color-fg`; the border keeps the token. A warning colour that carries dark text as a fill is too light for text on a light background.

## Variant, appearance and size

The three properties are independent of each other, and every combination works.

| `appearance` | What is painted |
| --- | --- |
| `filled` | The fill of the variant, its border, and the text colour for that fill. |
| `outlined` | No fill. The border and the text have the colour of the variant; `neutral` has the border colour of the theme. |
| `plain` | No fill and no border, only the text in the colour of the variant. Underlined on hover, like a link. |

`variant`, `appearance` and `size` are reflected: the element writes them onto itself as attributes, the defaults included (`<el-button variant="neutral" appearance="filled" size="medium">`), so that they can be selected from a stylesheet (`el-button[variant='brand']`). A value the button does not know is painted like the default.

The `hidden` attribute hides the button.

## Migrating from the `variant` / `outline` API

Before, the button had seven variants and an `outline` flag. The old values are not mapped; a button that still uses them is painted neutral and filled.

| Before                                             | Now                                              |
| -------------------------------------------------- | ------------------------------------------------ |
| `variant="default"` (or none)                      | `variant="neutral"` (or none)                    |
| `variant="primary"`                                | `variant="brand"`                                |
| `variant="success"`, `"warning"`, `"danger"`       | unchanged                                        |
| `variant="text"`                                   | `variant="brand" appearance="plain"`             |
| `outline="true"`                                   | `appearance="outlined"`                          |
| `variant="neutral"` (dark fill in the text colour) | no successor: `neutral` is the muted default now |

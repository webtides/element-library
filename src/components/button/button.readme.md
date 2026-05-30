# Button

`button` is a themeable button. It renders a native `<button>` — or an `<a>` when `href` is set — and decorates it with the library's `--el-*` design tokens. It supports semantic variants, sizes, outline / pill / circle shapes, prefix & suffix icon slots, an optional dropdown caret and a loading spinner. The API is modelled on [Shoelace's `<sl-button>`](https://shoelace.style/components/button).

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
<el-button variant="primary">Save changes</el-button>

<!-- As a link -->
<el-button href="/docs" target="_blank">Read the docs</el-button>

<!-- With icons in the prefix / suffix slots -->
<el-button variant="primary">
    <el-svg-use slot="prefix" name="icon-user" spritePath=""></el-svg-use>
    Account
</el-button>
```

> Boolean attributes are passed as strings (`disabled="true"`), matching the rest of the library's form components.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'default'` | `default`, `primary`, `success`, `neutral`, `warning`, `danger` or `text`. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`. |
| `outline` | `boolean` | `false` | Transparent fill with a colored border. |
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

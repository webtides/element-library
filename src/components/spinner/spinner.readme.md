# Spinner

`spinner` shows that something is going on whose end is not known: a ring with a quarter that turns. It stands on its own, for a section or a page that is loading; the loading state of `el-button` has a spinner of its own.

Without a theme imported the spinner takes both of its colours from the text colour, so it shows on any background. With a theme the quarter that turns has the accent colour.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/spinner/define';
```

```html
<el-spinner></el-spinner>

<!-- Named in the language of the page -->
<el-spinner label="Wird geladen"></el-spinner>

<!-- Larger: the spinner is as large as the text -->
<el-spinner style="font-size: 3rem"></el-spinner>
```

## API

#### Properties/Attributes

| Name    | Type     | Default     | Description                                                                  |
| ------- | -------- | ----------- | ---------------------------------------------------------------------------- |
| `size`  | `string` | `'medium'`  | `small`, `medium` or `large`: 0.8, 1 or 1.25 times the font size. Reflected. |
| `label` | `string` | `'Loading'` | The accessible name of the spinner.                                          |

#### Methods

_None._

#### Events

_None._

#### Slots

_None._

#### CSS Parts

| Name   | Description                                              |
| ------ | -------------------------------------------------------- |
| `base` | The ring. It carries `role="progressbar"` and the label. |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-spinner-indicator-color` | `--el-color-accent`, the text colour without a theme | The quarter of the ring that turns. |
| `--el-spinner-track-color` | a fifth of the text colour | The ring it turns on. |

## Size

A spinner is `1em` wide and high: as large as the text it stands in. The font size is what sizes it, on the spinner itself (`font-size: 3rem`) or on any element around it. In a heading it is as large as the heading.

`size` steps from there: `small` is 0.8 times, `large` 1.25 times the font size. These are the factors the sizes of `el-button` have. `size` is reflected: the element writes it onto itself as an attribute, the default included (`<el-spinner size="medium">`), so that it can be selected from a stylesheet.

The thickness of the ring is an eighth of its size. Change it on the part: `el-spinner::part(base) { border-width: 2px; }`.

## Colours

The quarter that turns reads `--el-spinner-indicator-color`, then `--el-color-accent`, then the text colour. The ring reads `--el-spinner-track-color`; unset, it is the text colour at a fifth of its strength.

On a coloured surface the accent colour may not show. Let the indicator follow the text there:

```css
.banner el-spinner {
    --el-spinner-indicator-color: currentColor;
}
```

There is no `variant`. A variant carries a meaning (`success`, `danger`), and a wait has none.

The `hidden` attribute hides the spinner.

## Accessibility

- The ring is a progress bar without a value (`role="progressbar"`, no `aria-valuenow`), which is how an indeterminate progress is exposed. Its name is the `label`, "Loading" by default. Set `label` to translate it, or to say what is loading.
- Next to a visible text that already says what is going on, the spinner is decoration. Put `aria-hidden="true"` on it, so that a screen reader does not announce both.
- A spinner does not announce itself when it appears. To tell a screen reader user that a region is loading, set `aria-busy="true"` on that region, or write the message into a live region of the page.
- For a user who prefers reduced motion (`prefers-reduced-motion: reduce`) the ring turns at half the speed. It does not stand still: a ring that does not move looks like a wait that got stuck.

## Server-side rendering

The ring, its role and its name are part of the server-rendered markup (Declarative Shadow DOM), so the spinner turns before its JavaScript has loaded, and without JavaScript.

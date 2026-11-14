# Copy Button

`copy-button` copies a text to the clipboard with one press and says whether that worked: an install command, an API key, a link to share. The text is `value`, or the content of another element of the page named by `from`.

After a press the icon of the button shows the outcome for a moment, a check mark or a cross, and a screen reader hears it.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/copy-button/define';
```

```html
<el-copy-button value="npm i --save @webtides/element-library"></el-copy-button>

<!-- The text of another element: a code block -->
<pre id="snippet">npm i --save @webtides/element-library</pre>
<el-copy-button from="snippet" label="Copy the command"></el-copy-button>

<!-- The value of a control -->
<input id="token" value="4f9a-22c1" readonly />
<el-copy-button from="token" label="Copy the token"></el-copy-button>
```

> Boolean attributes are passed as strings (`disabled="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `''` | The text to copy. |
| `from` | `string` | `''` | The id of an element whose content is copied in the place of `value`. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `size` | `string` | `'medium'` | `small`, `medium` or `large`. Reflected. |
| `feedback-duration` | `number` | `1500` | How long the outcome is shown, in milliseconds. |
| `label` | `string` | `'Copy'` | The accessible name of the button. |
| `success-label` | `string` | `'Copied'` | What a screen reader hears after the text was copied. |
| `error-label` | `string` | `'Could not copy'` | What a screen reader hears after the text could not be copied. |
| `status` | `string` | `'idle'` | The outcome that is shown right now: `idle`, `success` or `error`. Set by the button, reflected. |

#### Methods

| Name      | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| `copy()`  | Copies the text and shows the outcome. Resolves with `true` when the text was copied. |
| `focus()` | Focuses the button.                                                                   |
| `blur()`  | Removes the focus from the button.                                                    |
| `click()` | Simulates a click on the button.                                                      |

#### Events

| Name                | Detail              | Description                                            |
| ------------------- | ------------------- | ------------------------------------------------------ |
| `copy-button-copy`  | `{ value: string }` | The text was copied. `detail.value` is the text.       |
| `copy-button-error` | `{ error: Error }`  | The text could not be copied. `detail.error` says why. |

#### Slots

| Name           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `copy-icon`    | The icon of the button. Unset, two sheets.                   |
| `success-icon` | The icon after the text was copied. Unset, a check mark.     |
| `error-icon`   | The icon after the text could not be copied. Unset, a cross. |

#### CSS Parts

| Name       | Description                                               |
| ---------- | --------------------------------------------------------- |
| `base`     | The native `<button>`.                                    |
| `icon`     | The icon, around the slot that is shown.                  |
| `feedback` | The text of the outcome, a live region that is not shown. |

#### CSS Custom Properties

_None._ The button reads the tokens of the theme: `--el-color-fg`, `--el-color-success`, `--el-color-danger`, `--el-control-height`, `--el-radius-md`.

## What is copied

Without `from` the button copies `value`.

With `from` it copies from the element with that id, which it looks up in the document, or in the shadow root the button is in. An element that has a `value` of its own, an `<input>`, a `<textarea>` or a field of this library, gives that value as it is. Any other element gives its text, without the white space around it, so a `<pre>` can be written on lines of its own. The element is read at the moment of the press: what the user has typed into an input by then is what is copied.

`from` comes before `value` when both are set.

## The outcome

A press ends in one of two ways.

- **The text was copied.** The icon is a check mark in the success colour of the theme, a screen reader hears `success-label`, and `copy-button-copy` is fired with the text in `event.detail.value`.
- **The text could not be copied.** The icon is a cross in the danger colour, a screen reader hears `error-label`, and `copy-button-error` is fired with the reason in `event.detail.error`. There are three reasons: there was nothing to copy (no text, or no element with the id in `from`), the page has no clipboard (a browser gives one to pages served over `https` and to `localhost` only), or the browser refused.

After `feedback-duration` milliseconds the button is as before. A second press within that time copies again and starts the time again.

`status` is `success` or `error` for as long as the outcome is shown, and `idle` otherwise. It is reflected, so a stylesheet can follow it: `el-copy-button[status='success']`. The button sets it; setting it from outside shows an outcome that did not happen.

Both events bubble and cross shadow roots. `copy()` does from a script what a press does, and resolves with whether the text was copied.

## Look

The button is a square of the control height of its `size`, the height of an `el-button` of that size, so the two line up in a row. It has no surface of its own: the icon has the text colour, and the button shows a tint of it under the pointer and while it is pressed.

It shows an icon only. Its name for a screen reader is `label`; to show a sighted user what the button does before it is pressed, give it an `el-tooltip`:

```html
<el-copy-button id="copy-token" from="token"></el-copy-button> <el-tooltip for="copy-token">Copy the token</el-tooltip>
```

The slots `copy-icon`, `success-icon` and `error-icon` take other icons. An `<svg>` slotted there gets the size of the default ones, one and a quarter of the font size of the button.

On a touch screen (`any-pointer: coarse`) the button is at least `--el-touch-target` wide and high, in every size.

The `hidden` attribute hides the button.

## Accessibility

- The button is a native `<button>`: it is a tab stop, and `Enter` and `Space` press it.
- Its name is the `label`, "Copy" by default. Where a page has more than one copy button, say what each one copies: "Copy the command", "Copy the token".
- The name does not change with the outcome, since what the button does has not changed. The outcome is written into a live region (`role="status"`), which a screen reader announces without moving its user: "Copied", or "Could not copy". Set `success-label` and `error-label` in the language of the page.
- The outcome does not rest on colour: the icon changes its shape.
- The focus stays on the button through a press and the outcome.

## Server-side rendering

The button, its name, its icon and the empty live region are part of the server-rendered markup (Declarative Shadow DOM). Copying needs the JavaScript of the element: until it has loaded, a press does nothing.

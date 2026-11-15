# ComboboxField

`combobox-field` takes a text the user writes, with suggestions the browser offers while they type: a city, a job title, the name of a product. It extends `input-field`, inheriting the label, help text, error message, `required`, `pattern`, the sizes and the touched-state handling.

The suggestions are a native `<datalist>`. The browser filters and shows them, and the keyboard and a screen reader work as the browser has them; the field has no list of its own.

A suggestion is an offer, not a limit: the value is free text, and the user may write something the list does not have. For a choice from a fixed list use `el-select-field`, for several texts `el-tag-field`.

It is headless by default: the control keeps the look of the browser. `styles/native.css` gives it the look of the input of `el-input-field`. The list of the suggestions is drawn by the browser and stays as it is.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/combobox-field/define';
```

```html
<el-combobox-field name="city" label="City" options='["Berlin", "Bern", "Bremen", "Brussels"]'></el-combobox-field>
```

#### The suggestions

`options` takes plain strings, or option objects in the shape the other fields have:

```js
field.options = ['Berlin', 'Bern'];
field.options = [
    { value: 'Berlin', label: 'Germany' },
    { value: 'Bern', label: 'Switzerland' }
];
```

The `value` of a suggestion is what a pick writes into the control, and so what the form submits. A `label` is a second text for it. What a browser shows of the two, and which of them it filters by, differs between browsers: do not put a value there that the user is not meant to see.

Without options the control has no list: it is a plain text input, also for a screen reader.

#### Suggestions from a server

`options` can change while the user types. Listen for `input-change`, load, and set the new list:

```js
field.addEventListener('input-change', async (event) => {
    field.options = await search(event.detail);
});
```

The browser filters the list by what is in the control, so a list the server has filtered already is filtered twice. That only shows when the server finds by something else than the start or a part of the value.

## API

#### Properties/Attributes

Inherits all of `input-field`'s properties (`type`, `size`, `placeholder`, `pattern`, `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect`, `spellcheck`) and of `form-field` (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name      | Type                                 | Default | Description                                  |
| --------- | ------------------------------------ | ------- | -------------------------------------------- |
| `options` | `Array<string \| { value, label? }>` | `[]`    | The suggestions. As an attribute it is JSON. |

A list works with the types that take text: `text` (the default), `search`, `email`, `url`, `tel`. Set `autocomplete="off"` where the suggestions of the browser's own history would stand beside the ones of the page.

#### Events

| Name           | Detail               | Description                                                          |
| -------------- | -------------------- | -------------------------------------------------------------------- |
| `input-change` | `string` (the value) | Fired when the value changes: typed, or picked from the suggestions. |

#### CSS States

Inherited from `form-field`: `touched`, `valid`, `invalid`.

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`). With `styles/native.css` the input has the border, the radius, the padding, the colours, the focus ring and the three sizes of the input of `el-input-field`.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the control is at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- The control is a native text input with a list: the browser makes it a combobox for a screen reader, named by the label (`<label for>`), and announces the suggestions as it shows them.
- The keyboard is the one of the browser: the arrow keys go through the suggestions, Enter takes one, Escape closes the list.
- Without options the control is a plain text input, with no list to announce.
- It names the help message in `aria-describedby`, and the error message while that is shown, and says whether it is valid (`aria-invalid`).
- Validation messages surface only once the field is `touched`. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

# TagField

`tag-field` takes a list of short texts the user writes: keywords of an article, skills in a profile, recipients of an invitation. It is a text input that turns what is entered into entries, each an [`el-tag`](../tag/tag.readme.md) with a remove button, and submits them under one name. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

For a list the page knows, use `el-checkbox-group-field`.

It is headless by default: the input keeps the look of the browser. `styles/native.css` gives it the look of the input of `el-input-field`. The tags bring their look along.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tag-field/define';
```

```html
<el-tag-field name="skills" label="Skills" value='["TypeScript", "Svelte"]'></el-tag-field>
```

The field registers `el-tag` itself.

#### Adding and removing

- **Enter** adds the text of the input as an entry. In a form it does not submit the form then; Enter in the empty input does, as in any text input.
- **A comma** ends an entry, typed or pasted: a pasted `news, offers, events` is three entries.
- **The remove button** of a tag takes its entry away. The focus goes to the entry that takes its place, or to the input after the last one.

An entry is trimmed. An empty one and one the list already has are not added.

#### Text that is still in the input

Text that is in the input when the form is submitted becomes an entry with the submit: nothing that was typed is lost on the way to the submit button. For a required field that text counts as an entry.

It does not become an entry earlier, when the user leaves the field. A new entry makes the field higher, and the submit button below it would move away under the pointer that is pressing it.

Outside of a form, text in the input is no entry until Enter or a comma.

#### The value

`value` is the list of the entries, in the order they were added. As an attribute it is JSON, from a script it is an array:

```js
field.value = ['TypeScript', 'Svelte'];
field.addEventListener('input-change', (event) => {
    event.detail; // ['TypeScript', 'Svelte', 'CSS']
});
```

In a form every entry is submitted under the `name`, by a hidden input: `formData.getAll('skills')`. A list the server rendered is submitted also before the script has run.

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` | `[]` | The entries, in the order they were added. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the input and of the tags. Reflected to the `size` attribute. |
| `placeholder` | `string` | `''` | Placeholder text shown while the input is empty. |
| `removeLabel` | `string` | `'Remove'` | The word the remove button of an entry is named with, in front of the entry: "Remove TypeScript". |
| `addedLabel` | `string` | `'Added'` | What a screen reader hears in front of an entry that was added: "Added TypeScript". |
| `removedLabel` | `string` | `'Removed'` | What a screen reader hears in front of an entry that was removed: "Removed TypeScript". |
| `status` | `string` | `''` | What the field last told a screen reader. Set by the field. |

`required` means at least one entry. The browser has no text for that in its bubble: it shows the `errorMessage` of the field, and "Add at least one entry." without one. As an `el-input-field`, the field is not marked as not valid before the user has been in it.

#### Events

| Name           | Detail                | Description                                                     |
| -------------- | --------------------- | --------------------------------------------------------------- |
| `input-change` | `string[]` (the list) | Fired when the entries change: added, removed, set by a script. |

#### CSS States

| Name      | Description                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- |
| `touched` | Set once the user has left the field. Moving from the input to a remove button does not set it. |
| `valid`   | Set while the field passes validation.                                                          |
| `invalid` | Set while the field fails validation (`required` with no entry and no text in the input).       |

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`). With `styles/native.css` the input has the border, the radius, the padding, the colours, the focus ring and the three sizes of the input of `el-input-field`.

The entries are `el-tag` in the size of the field, with the neutral variant. Style them as any tag, through their parts:

```css
el-tag-field el-tag::part(base) {
    border-radius: 999px;
}
```

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`. The entries stand below the input, in rows that wrap with a gap of `--el-space-1`. An entry that is longer than the field is cut off, its remove button stays.

On a touch screen (`@media (any-pointer: coarse)`) the input and the remove button of every tag are at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

## Accessibility

- The input is a native text input, named by the label (`<label for>`). It names the help message in `aria-describedby`, and the error message while that is shown, and says whether it is valid (`aria-invalid`) and required (`aria-required`).
- The entries are a list with the name of the field, after the input in the document: Tab goes from the input to every remove button, and on.
- Every remove button is named with its entry: "Remove TypeScript". Set `removeLabel` to the word of your language.
- A screen reader does not see an entry appear or go, so the field says it in a live region (`role="status"`): "Added TypeScript", "Removed TypeScript". Set `addedLabel` and `removedLabel` to the words of your language.
- Say in the help message how an entry is added: Enter, or a comma.
- Validation messages surface only once the field is `touched`. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.

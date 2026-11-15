# FileField

`file-field` takes one or several files for a form: a CV, a receipt, a picture. It renders a native `<input type="file">`, so the dialog of the system, a drop onto the control, the keyboard and the form submission are the ones of the browser. It extends `form-field`, inheriting the label, help text, error message, `required` and touched-state handling.

It is headless by default: the control keeps the look of the browser. `styles/native.css` gives it the border of the other fields and its button the tokens of the theme.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/file-field/define';
```

```html
<el-file-field name="cv" label="Your CV" accept=".pdf" required="true"></el-file-field>

<el-file-field name="receipts" label="Receipts" accept="image/*,.pdf" multiple="true"></el-file-field>
```

A form that submits files needs `method="post"` and `enctype="multipart/form-data"`, as with every file input.

#### The files and the value

`files` gives the chosen files, as a list of `File`. `value` is the list of their names, and `input-change` reports it:

```js
field.addEventListener('input-change', (event) => {
    event.detail; // ['cv.pdf']
    event.target.files; // [File]
});
```

The files come from the user. A script cannot choose one, the browser does not allow that: a `value` that names other files is put back to the names of the control. What a script can do is take the choice away, with an empty value:

```js
field.value = [];
```

#### Checks of the page

The browser knows `required` and nothing else about a file: `accept` only says what the dialog offers. The size, the number and the kind of the files are checked by the page. It renders the field as not valid, with the reason as the error message:

```html
<el-file-field
    name="picture"
    label="Profile picture"
    valid="false"
    error-message="The picture is larger than 5 MB."
></el-file-field>
```

## API

#### Properties/Attributes

Inherits all of `form-field`'s properties (`name`, `value`, `required`, `disabled`, `label`, `labelScreenReaderOnly`, `errorMessage`, `helpMessage`, `valid`, `touched`) and adds:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` | `[]` | The names of the chosen files. It follows the control; an empty list takes the choice away. |
| `files` | `File[]` | `[]` | The chosen files. Read only, and no attribute. |
| `accept` | `string` | `''` | The kinds of files the dialog offers (`image/*`, `.pdf,.docx`). Empty offers every file. |
| `multiple` | `boolean` | `false` | Whether more than one file can be chosen. |
| `capture` | `string \| null` | `null` | A phone takes the picture or the recording with its camera (`user`, `environment`) and does not open its files. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the control. Reflected to the `size` attribute. It shows once the control is decorated. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input-change` | `string[]` (the value) | Fired when the user has chosen files, also ones with the names of the files before, and when the choice was taken away. |

#### CSS States

| Name      | Description                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| `touched` | Set once the user has left the control for another place of the page. The dialog does not set it. |
| `valid`   | Set while the field passes validation.                                                            |
| `invalid` | Set while the field fails validation (`required` with no file, or the page says so with `valid`). |

#### CSS Custom Properties

Headless by default. The texts read the tokens every field reads (`--el-color-fg`, `--el-color-fg-muted`, `--el-color-danger`, `--el-font-size-sm`, `--el-space-1`, `--el-space-2`).

With `styles/native.css` the control has the border, the radius, the colours and the focus ring of the input of `el-input-field`, and its height in each of the three sizes. Its button is a plain surface in `--el-color-bg-muted` with the radius `--el-radius-sm`. The words on the button and beside it are the ones of the browser, in the language of the user.

The label, the help message, the control and the error message stack in a column, and the texts have one look in every field: see [Layout](../form-field/form-field.readme.md#layout) in the readme of `form-field`.

On a touch screen (`@media (any-pointer: coarse)`) the control is at least `--el-touch-target` high. Without that token, and on a fine pointer, the size stays as it is.

## Accessibility

- Uses a native `<input type="file">`: it is a button for a screen reader, which reads the name of the chosen file with it. Enter and Space open the dialog.
- The control is named by the label (`<label for>`). It names the help message in `aria-describedby`, and the error message while that is shown, and says whether it is valid (`aria-invalid`).
- Validation messages surface only once the field is `touched`. The dialog of the system takes the focus from the page, which does not touch the field: the error message of a required field does not show behind the dialog. The error message is an alert (`role="alert"`): a screen reader announces it when it appears.
- Say in the help message what the page takes: the kinds of files and the largest size.

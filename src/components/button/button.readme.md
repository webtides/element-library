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
| `disabled` | `boolean` | `false` | Disables the button. Reflected: the attribute is there while the button is disabled, see [In a form](#in-a-form). |
| `toggle` | `boolean` | `false` | The button is a toggle button: a click flips `pressed`, see [A toggle button](#a-toggle-button). Button-only. |
| `pressed` | `boolean` | `false` | Whether a toggle button is pressed. Reflected on a toggle button (`pressed="true"` / `"false"`). Without `toggle` it does nothing. |
| `type` | `string` | `'button'` | `button`, `submit` or `reset`. `submit` / `reset` act on the form of the button, see [In a form](#in-a-form). Button-only. |
| `name` | `string` | `''` | Name submitted with the form, when the form is submitted with this button. Button-only. |
| `value` | `string` | `''` | Value submitted under that name. Button-only. |
| `href` | `string` | `''` | When set, the button renders as a link to this URL. |
| `target` | `string` | `''` | Where to open the linked URL. Link-only. |
| `rel` | `string` | `'noreferrer noopener'` | `rel` for the link (only emitted alongside `target`). Link-only. |
| `download` | `string` | `''` | Tells the browser to download the linked URL. Link-only. |

The attributes `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate` and `formtarget` do what they do on a native button, see [In a form](#in-a-form). They are attributes only, not properties.

#### Methods

| Name              | Description                                  |
| ----------------- | -------------------------------------------- |
| `focus(options?)` | Focuses the underlying control.              |
| `blur()`          | Removes focus from the underlying control.   |
| `click()`         | Simulates a click on the underlying control. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `button-toggle` | `{ pressed: boolean }` | Fired when a click has flipped a toggle button. `detail.pressed` is the new state. Not fired when `pressed` is set from a script. |

Native `click`, `focus` and `blur` behave as usual.

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

Without a theme a fill and the label on it are a pair that does not depend on the page. The neutral pair follows the colour scheme (`light-dark()`): a light grey with a dark label, and a dark grey with a light label in a dark scheme. The other four are one pair for both schemes. A label without a fill has the text colour of the page, and the warning colour is mixed with that one.

The keyboard focus shows as a ring around the button: `--el-focus-ring-width` wide, in `--el-color-focus-ring`, and `--el-focus-ring-offset` away from its edge. Without `--el-color-focus-ring` the ring is inside of the button, in the colour of its label, the width of the border inside of the border. Nothing says which colours the page around the button has then, and the label can be read on the surface of the button: on its fill, and on the page where it has none. The ring inside is the `::after` of the control (`::part(base)::after`). Where the user forces colours, the ring is around the button in both cases, in a colour of the system.

## Variant, appearance and size

The three properties are independent of each other, and every combination works.

| `appearance` | What is painted |
| --- | --- |
| `filled` | The fill of the variant, its border, and the text colour for that fill. |
| `outlined` | No fill. The border and the text have the colour of the variant; `neutral` has the border colour of the theme. |
| `plain` | No fill and no border, only the text in the colour of the variant. Underlined on hover, like a link. |

`variant`, `appearance` and `size` are reflected: the element writes them onto itself as attributes, the defaults included (`<el-button variant="neutral" appearance="filled" size="medium">`), so that they can be selected from a stylesheet (`el-button[variant='brand']`). A value the button does not know is painted like the default.

The `hidden` attribute hides the button.

## In a toolbar

An [`el-toolbar`](../toolbar/toolbar.readme.md) gives its controls one size and one appearance. A button takes them from the toolbar while the page has not set `size` or `appearance` on the button itself:

```html
<el-toolbar label="Message" size="small" appearance="outlined">
    <el-button>Reply</el-button>
    <!-- small, outlined -->
    <el-button size="large">Archive</el-button>
    <!-- large, outlined -->
    <el-button variant="brand" appearance="filled">Send</el-button>
    <!-- small, filled -->
</el-toolbar>
```

- A button that names its own keeps it, also when that is the default: `appearance="filled"`, `size="medium"`. It counts as named when the page wrote the attribute, when a script set the property before the button was connected, or when either changes later.
- The toolbar does not write to the button. It says its size and its appearance in CSS properties that are inherited, and the button reads them in its stylesheet. The `size` and `appearance` attributes of the button keep their own values, `medium` and `filled` for a button that names none.
- It works at any depth: for a button in an `el-button-group` of the toolbar, and for the anchor of an `el-popover`.
- Outside of a toolbar nothing changes.

## In the frame of an application

A button with `data-navigation-toggle` opens the navigation of an [`el-app-frame`](../app-frame/app-frame.readme.md) where the frame is narrow and the navigation is a drawer. Where the navigation is a column beside the content, there is nothing to open, and the button is not there. The frame says so in a CSS property that is inherited, and the button reads it in its own stylesheet: that holds before any script has run. Outside of a frame the attribute changes nothing.

```html
<el-button data-navigation-toggle circle="true" aria-label="Navigation"><svg aria-hidden="true">…</svg></el-button>
```

## A toggle button

With `toggle` the button stays pressed: "Bold" in the toolbar of an editor, "Mute", a filter above a list, the star of a favourite.

```html
<el-button toggle="true" appearance="outlined">Bold</el-button>
<el-button toggle="true" pressed="true" appearance="outlined">Italic</el-button>
<el-button toggle="true" appearance="plain" circle="true" aria-label="Favourite">★</el-button>
```

```js
button.addEventListener('button-toggle', (event) => {
    editor.bold = event.detail.pressed;
});
```

- **The state** is `pressed`, a property and an attribute (`pressed="true"`, `pressed="false"`). A toggle button writes the attribute itself, so a stylesheet can select it: `el-button[pressed='true']`.
- **A click flips it**, and so do the Space and the Enter key. Then the button fires `button-toggle`. A `click` listener of the page that calls `preventDefault()` keeps the button from flipping. Setting `pressed` from a script changes the state and fires nothing.
- **A screen reader** announces a toggle button with its state: the control has `aria-pressed="true"` or `"false"`. A button without `toggle` has no `aria-pressed`.
- **A pressed button shows it** with a ring inside of its edge, in the colour of its label, in every variant and appearance. An `outlined` and a `plain` button get a tint of their text colour as well; a fill is not changed, the label on it would lose contrast. The ring is a shape and a border: it tells the button apart without a colour, and stays where the user forces colours, a little wider. It is the `::before` of the control (`::part(base)::before`).
- **In an `el-button-group`** a pressed button keeps its joined corners and the line to its neighbour; the ring has the corners of the button.
- **In server-rendered markup** `aria-pressed` and the ring are there before the script has run. The click needs the script.

`aria-pressed` that the page sets itself, on a button without `toggle`, goes to the control as before, and no click changes it. Such a button shows the ring as well.

#### What it is not

- **Not a value of a form.** A toggle button submits nothing. A setting that is saved with a form is an [`el-switch-field`](../switch-field/switch-field.readme.md) or an [`el-checkbox-field`](../checkbox-field/checkbox-field.readme.md).
- **Not a button whose name changes with its state.** A button that reads "Mute" and then "Unmute" says its state with its name, and is no toggle: with `aria-pressed` on top a screen reader would announce "Unmute, pressed". Give a toggle button one name that stays ("Mute"), and let the state say the rest.
- **Not one choice of several.** A toggle button knows nothing of its neighbours: in a row of them, any number can be pressed. A row of which one is chosen at a time is an [`el-segmented-field`](../segmented-field/segmented-field.readme.md).
- **Not a link.** `toggle` is ignored on a button with `href`.

## In a form

An `el-button` of the type `submit` submits its form as a native submit button does, and one of the type `reset` resets it.

```html
<form>
    <el-input-field name="title" label="Title" required="true"></el-input-field>
    <el-button type="submit" name="action" value="draft" formnovalidate>Save as draft</el-button>
    <el-button type="submit" name="action" value="publish" variant="brand">Publish</el-button>
</form>

<!-- From outside of the form -->
<el-button type="submit" form="settings">Save</el-button>
```

- **The form of the button** is the nearest `<form>` around it, or the one its `form` attribute names by id.
- **`name` and `value`** are in the data of the form when it is submitted with this button, and with no other. Both are text, submitted as they are written.
- **`formaction`, `formenctype`, `formmethod`, `formnovalidate` and `formtarget`** say how the form is submitted with this button. A "Cancel" with `formnovalidate` submits a form that is not valid.
- **Enter in a field** submits the form with its first submit button, as the platform does. While that button is disabled or loading, Enter does not submit.
- **A `click` listener that calls `preventDefault()`** keeps the button from submitting or resetting, as it does with a native button: on the `el-button`, on an element in it or around it. The button acts once every listener has had the click, inside of that click. After a listener that stops the click on its way (`stopPropagation()`), it acts a task later.
- **A `<fieldset disabled>`** around the button disables it: it fires no click, takes no focus and is painted as disabled. Its `disabled` property keeps saying what the page has set.
- **`form.elements`** lists the button. The element is form-associated.

#### The native submit button

A form is submitted with a submit button that belongs to it. The control of `el-button` is in a shadow root and has no form, so a button of the type `submit` submits with a hidden native `<button type="submit">` that is a child of the element. That button carries the `name`, the `value` and the attributes above.

- The element makes it when the form is first submitted with the button: with a click on the `el-button`, or with Enter in an `<input>` or a `<select>` of the form. Until then the children of the `el-button` are what the page wrote. After that it stays, as the last child.
- It is the `submitter` of the `submit` event: `event.submitter.closest('el-button')` is the `el-button`.
- Enter in a field clicks it, so a `click` listener on the `el-button` hears that click, with the native button as its target. A native submit button hears the same click.
- When the page replaces the content of the `el-button`, the element makes it again with the next submit.
- `form.querySelector('[type="submit"]')` does not find it before the first submit. `form.elements` lists the `el-button` from the start.

#### On a page that a framework hydrates

A framework that hydrates a server-rendered page expects the children it rendered, and no other. The element adds its native submit button for a submit only, so a server-rendered `el-button` hydrates also when the element has started before the framework does (Svelte 5: no `hydration_mismatch`). The page has nothing to write for that.

One case is left: a submit before the hydration that does not leave the page, such as a click on the button of a form that is not valid. The native button is there afterwards, and the framework finds a child it did not render. A page that writes the native submit button itself, as in [Before the script has run](#before-the-script-has-run), does not have that case: the framework has rendered the button and expects it.

#### The `disabled` attribute

For the platform an attribute that is there disables a form-associated element, whatever its value. So the attribute follows the property: the element has `disabled="true"` while it is disabled, and no `disabled` attribute while it is not. `disabled="false"` and a `disabled` without a value are read as not disabled, as before, and are taken off the element.

#### Before the script has run

In server-rendered markup a click on the button does not submit the form: the control is in the shadow root, and the script is what hands the click on ([#86](https://github.com/webtides/element-library/issues/86)). Enter in a field does, when the page writes the native submit button itself. The element takes that one and adds no second:

```html
<el-button type="submit" name="action" value="save">
    Save
    <button type="submit" hidden name="action" value="save"></button>
</el-button>
```

## ARIA attributes

The element itself has no role. What takes the focus and what a screen reader announces is the `<button>` or `<a>` inside it, so the ARIA attributes you put on `el-button` are passed on to that control:

```html
<!-- An icon button gets its name -->
<el-button circle="true" aria-label="Add">+</el-button>

<!-- A button that opens something -->
<el-button aria-expanded="false" aria-controls="filters">Filters</el-button>

<!-- Described by a text elsewhere in the page -->
<el-button variant="danger" aria-describedby="delete-hint">Delete</el-button>
<p id="delete-hint">This cannot be undone.</p>
```

| Attributes | How they reach the control |
| --- | --- |
| `aria-label`, `aria-description`, `aria-expanded`, `aria-haspopup`, `aria-pressed`, `aria-current` | As the same attribute, with every change. |
| `aria-labelledby`, `aria-describedby`, `aria-controls` | As references to the elements they name. An id does not reach out of the shadow root the control is in. |

- The attributes stay on the element as well, where a stylesheet can select them: `el-button[aria-expanded='true']`.
- `aria-pressed` is the state of a button that stays pressed. With [`toggle`](#a-toggle-button) the button keeps that state itself, and an `aria-pressed` of the page gives way to it.
- An empty attribute counts as not set.
- `aria-disabled` and `aria-busy` are not passed on. The button sets them itself, from `disabled` and `loading`.
- The elements behind an id are looked up in the document, or in the shadow root the button is used in, when the button renders. An element that comes into the page later is found once the attribute is set again.
- The references need a browser that knows them (`ariaDescribedByElements`: Chrome 135, Firefox 136, Safari 16.4). In an older one the three relations are not there, as before; the other attributes work everywhere.
- In server-rendered markup the first group is on the control from the start. The references need the JavaScript of the element.

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

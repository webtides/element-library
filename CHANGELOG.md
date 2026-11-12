# Change Log

All notable changes to `@webtides/element-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/). Per-component changelogs live next to each component (`src/components/<name>/<name>.changelog.md`); this file is the aggregated, package-level view.

<!--
   PRs should add an entry to the Unreleased section below, grouped by component.
   Mirror the same entry in the component's own changelog. Uncomment subsection
   headings as needed.
-->

## Unreleased

### Packaging

- Changed: `@webtides/element-js` is now required at `^1.3.1` (was `^1.2.11`). The range already let fresh installs resolve to it; the library is now built and tested against it. 1.3.0 reworks hydration and the server-side string renderer, which shows up here in two ways. Fixed: after hydrating server-rendered markup, property updates reach the rendered controls again — on 1.2.11, toggling `disabled` on a hydrated `el-button`, `el-input-field`, `el-textarea-field`, `el-password-field`, `el-checkbox-field`, `el-switch-field` or `el-amount-field` left the inner control unchanged. Fixed: server-rendered form fields without a value no longer emit `value="null"` on the native control (`el-input-field`, `el-password-field`, `el-select-field`, `el-checkbox-field`, `el-switch-field`). 1.3.1 fixes the server output of `spreadAttributes()`, see `button` below.
- Changed: the `./catalog` SSR smoke test (`npm run test:catalog`) now runs against `@webtides/element-js-ssr-renderer` `^0.4.0` (was `^0.1.0`), the version consumers install today. Dev dependency only; the generated `catalog.js` is unchanged.
- Changed: the shipped type declarations (`types/**`) are generated with TypeScript 7 (was 6). Component declarations now keep their `extends` clause and import the base class from `@webtides/element-js`, and `index.d.ts` imports the names it re-exports. `@webtides/element-js` ships no declarations of its own, so a project that type-checks declaration files (`skipLibCheck: false`) with `noImplicitAny` now gets TS7016 from the component declarations as well; before, it got unresolved-name errors from `index.d.ts` only. With `skipLibCheck: true` the declarations behave as before.
- Added: the `./catalog` export ships a type declaration (`catalog.d.ts`). `import catalog from '@webtides/element-library/catalog'` now type-checks under `strict` without a `declare module` shim; before, it failed with TS7016. The default export is typed as a map from tag to lazy loader (`Record<string, () => Promise<unknown>>`), a shape the `resolve` option of `@webtides/element-js-ssr-renderer` accepts.

### Theming

- Added: `--el-color-warning`, the colour of the `warning` variant, is a token of the shipped themes. `el-button` and `el-notification` already read it and fell back to `#f59e0b`, which is the value the three themes now set, so nothing looks different. It is one value for both colour schemes: a warning fill carries dark text, so the colour has to stay light. ([#69](https://github.com/webtides/element-library/issues/69))
- Added: shared style modules in `src/styles/` (`host`, `size`, `variants`, `appearance`, `form-control`). A component composes them into its own stylesheet instead of carrying a copy: `size` and `variants` resolve the `size` and `variant` attributes of the host to internal properties, `appearance` paints the colours of the variant as `filled`, `outlined` or `plain`, `form-control` is the layout of a field around its control. `el-button` and `el-input-field` are the first two components on them. The modules are internal to the library and ship with it; there are no cascade layers yet, and no new token beside `--el-color-warning`. ([#69](https://github.com/webtides/element-library/issues/69))
- Added: `styles/native.css`, an opt-in stylesheet that gives the native control of a field the look of the tokens: border, radius, padding, colours, focus ring. It reaches the input of `el-input-field` and `el-password-field`, the textarea of `el-textarea-field` and the select of `el-select-field`, with the selectors the themes had; native controls that are not in a field are not touched. It is in no cascade layer: a reset of the page that is in none (Tailwind CSS v3, a classic `reset.css`) wins over every rule in a layer and would take the border and the padding away again. A variant in a layer, for every native control of the page, is open in [#106](https://github.com/webtides/element-library/issues/106). ([#69](https://github.com/webtides/element-library/issues/69))
- Added: cascade layers for the themes and the utilities: `el-tokens` and `el-utilities`, in that order. `styles/layers.css` holds the statement on its own, to place the two among the layers of the page. `native.css` and the styles of the components are in no layer, because a layer loses against every rule of the page that is in none. ([#69](https://github.com/webtides/element-library/issues/69))
- Added: `styles/utilities.css`, opt-in, with one class so far: `el-visually-hidden` takes an element off the screen and keeps it for assistive technology. ([#69](https://github.com/webtides/element-library/issues/69))
- Added: `--el-select-indicator-color`, the colour of the chevron of a decorated `el-select-field`. Unset, it is `--el-color-fg-muted`; the high-contrast theme sets it to `--el-color-fg`, which a rule of that theme did before. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: `--el-touch-target` now reaches every control. On a touch screen (`@media (any-pointer: coarse)`) no control of the library is smaller than the token in either direction; before, only `el-amount-field` read it, for the height of its buttons. That covers `el-button` in every size and shape, the text fields and the select, the password toggle and the clear cross of a field, the labels of `el-checkbox-field`, `el-switch-field` and `el-radio-field`, the close buttons of `el-dialog` and `el-notification`, the buttons and the input of `el-amount-field`, the arrows and dots of `el-slider` and `el-carousel`, `el-tab-link` and the header of `el-accordion`; the entries below have the details. With the shipped themes the token is 44 px (48 px in the high-contrast theme), so layouts get higher and wider on a touch screen: a small button is as high as a medium one, a checkbox row is 44 px high, the header of a dialog grows with its close button. With a mouse or trackpad alone, and without the token (no theme), every size is as before. A theme of your own only has to set `--el-touch-target`. Note that `any-pointer: coarse` also matches a laptop with a touch screen. ([#91](https://github.com/webtides/element-library/issues/91), [#95](https://github.com/webtides/element-library/issues/95))
- Changed: BREAKING: a theme sets tokens and no longer decorates form controls. The rules for the inputs, textareas and selects of the fields have left `default.css`, `high-contrast.css` and `sketchy.css` and are in `styles/native.css`. A page that imports a theme and wants its fields to look as before imports that file as well: `import '@webtides/element-library/styles/native.css'`. With both, the fields look as before, in every theme; without `native.css` their controls keep the look of the browser. The sketchy theme keeps what no token can carry: its `@font-face`, and its rules for the accordion, the tabs and the carousel. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: the tokens of a theme are in the cascade layer `el-tokens`. A token that the page sets in no layer wins over the theme wherever it is loaded; before, the one that came later won. If the page's own CSS is in layers as well (Tailwind CSS v4), the order of the layers decides between its tokens and the theme's. ([#69](https://github.com/webtides/element-library/issues/69))
- Fixed: on a touch screen a decorated input or select is at least `--el-touch-target` high also when the theme comes after the styles of the field in the cascade, as an adopted stylesheet for example. The minimum height of the theme had the same weight as the touch rule of the field and won there: 42 px with the default theme. `native.css` now states the touch rule as well, so the order no longer decides. ([#69](https://github.com/webtides/element-library/issues/69))

### accordion

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the header is at least `--el-touch-target` high. With the default and the sketchy theme it already was; with the high-contrast theme it was 46 px with a target of 48 px. Unchanged on a fine pointer and without the token.
- Fixed: `collapse()` no longer throws `Cannot read properties of undefined (reading 'style')` when the accordion is removed from the DOM before its two animation frames have run (for example a closed accordion that is connected and removed again right away). The content node is now captured up front instead of being read from `$refs` inside the frames, which element-js clears on disconnect.

### amount-field

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the plus and minus buttons are at least `--el-touch-target` wide, and the input is as high as the buttons. With the default theme the buttons were 33 and 29 px wide and the input 34 px high. The height of the buttons follows the token on every pointer, as before. Unchanged on a fine pointer and without the token.
- Changed: the `label` is rendered: a `<label>` above the stepper, inside the shadow root, that names the number input. Style it with `::part(label)`. Before, the field took the attribute and showed nothing, and the input had no accessible name (axe `label`). ([#94](https://github.com/webtides/element-library/issues/94))

### button

- Added: `appearance` (`filled` by default, `outlined` or `plain`): how the colours of the variant are painted. It works with every variant, so a `plain` button, text only, exists in every colour; before, only the `text` variant in the brand colour did. ([#69](https://github.com/webtides/element-library/issues/69))
- Added: `variant`, `appearance` and `size` are reflected to attributes of the same name, the defaults included, so a stylesheet can select them (`el-button[variant='brand']`). ([#69](https://github.com/webtides/element-library/issues/69))
- Added: a pressed style: a button that is pressed (`:active`) is darker than a hovered one; an `outlined` or `plain` button gets a tint of its text color instead. Before, pressing a button on a touch screen showed nothing.
- Changed: BREAKING: the button speaks the library's shared vocabulary. `variant` is `neutral` (the default), `brand`, `success`, `warning` or `danger`, and the new `appearance` replaces the `outline` flag and the `text` variant. The old values are not mapped, a button that still uses them is painted neutral and filled. Rename `variant="primary"` to `variant="brand"`, `variant="default"` to `variant="neutral"` (or leave it out), `variant="text"` to `variant="brand" appearance="plain"` and `outline="true"` to `appearance="outlined"`. Buttons that are renamed this way look as before, in every theme. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: BREAKING: the dark `neutral` button, filled in the text colour, is gone. `neutral` now is what `default` was: the muted fill with the border of the theme. There is no successor for the dark fill. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: the control inside the shadow root no longer has classes for the variant, the size and the outline (`button--primary`, `button--small`, `button--outline`). Select the host by its attributes instead. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the button is at least `--el-touch-target` wide and high, in every size and shape. With the default theme a small button was 32 px high, a medium one 42 px and a small `circle` 32 × 32 px. A circle stays round. Unchanged on a fine pointer and without the token.
- Fixed: the `hidden` attribute hides the button. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))
- Fixed: a server-rendered `el-button` no longer writes unset attributes as the string `undefined` onto its control. A link button (`href` set) carried `target='undefined'`, `rel='undefined'` and `download='undefined'` in the Declarative Shadow DOM, and a `download` attribute makes the browser save the link target instead of navigating to it. A native button carried `name='undefined'` and `value='undefined'`. The fix is in `@webtides/element-js` 1.3.1 ([element-js#192](https://github.com/webtides/element-js/issues/192)), which the library now requires.
- Fixed: no hover style stays on the button after a tap. A touch screen leaves `:hover` on the element that was tapped last, so the button looked hovered until the next tap elsewhere. The hover styles now only apply where the pointer can hover (`@media (hover: hover)`).
- Fixed: the label of an outlined `warning` button is readable on a light background. Its colour is `--el-color-warning` mixed half and half with `--el-color-fg` now, which makes it darker in a light scheme and lighter in a dark one; the border keeps the token. Before, the label had the colour of the token, which has to be light for the dark text of the filled button: `#d97706` was 3.18 : 1 on white as a label and is 7.86 : 1 now. ([#94](https://github.com/webtides/element-library/issues/94))

### carousel

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the arrows are at least `--el-touch-target` wide and high (28 × 22 px before). The bullets keep their size of 13 px: each gets a hit area of `--el-touch-target` around its dot, and the bullets move apart by as much, so that the areas do not overlap. The row of bullets wraps when it gets wider than the carousel. Unchanged on a fine pointer and without the token.
- Changed: the copies of the slides that Glide needs for looping are kept in the shadow root. The children of the element stay what the page wrote: before, four slides became eight children as soon as the carousel started, and a framework that hydrated a server-rendered carousel with slides from a loop found nodes it had not rendered (Svelte 5: `hydration_mismatch`, the page was built again). A rule of the page's style sheets still styles a copy when it selects the slide by a class; a selector that needs an ancestor outside the carousel (`el-carousel > div`, `.gallery .slide`) no longer reaches the copies. See "Looping, and server-rendered slides" in the readme. ([#96](https://github.com/webtides/element-library/issues/96))
- Fixed: the arrow buttons have an accessible name when their slots are empty: "Previous slide" and "Next slide", for screen readers only. What is put into the `arrow-left` and `arrow-right` slots replaces that name, as it named the button before. An arrow with an empty slot was a button without a name (axe `button-name`). ([#94](https://github.com/webtides/element-library/issues/94))
- Fixed: going on from the last slide shows the first slide coming in. It showed a copy of the second one, which then jumped to the first: the copies after the last slide were in the wrong order. ([#96](https://github.com/webtides/element-library/issues/96))
- Fixed: `api.update()` keeps the slides. After an update Glide took the `<slot>` for its only slide, so the carousel had one empty slide. ([#96](https://github.com/webtides/element-library/issues/96))
- Fixed: what a page puts into the `arrow-left` or `arrow-right` slot no longer gets the margins of a slide gap. ([#96](https://github.com/webtides/element-library/issues/96))

### checkbox-field

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the label, which is the hit area of the checkbox, is at least `--el-touch-target` wide and high. Before, it was as high as its line of text. Unchanged on a fine pointer and without the token.
- Fixed: the error message is an alert (`role="alert"`), so a screen reader announces it the moment it appears. ([#94](https://github.com/webtides/element-library/issues/94))

### dialog

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high (20 × 20 px before). Its icon keeps its size, and the header grows with the button. Unchanged on a fine pointer and without the token.

### form-field

- Added: the readme says how the fields take part in a native `<form>` ("In a form"): what is submitted, what `disabled` and `required` do, and what does not work yet. Every statement there is covered by a test of the field. ([#69](https://github.com/webtides/element-library/issues/69))
- Fixed: the error message is announced by screen readers. It is an alert now (`role="alert"`), so it is read the moment it appears, and the fields name it in the `aria-describedby` of their control while it is shown, so it is read again when the control gets focus. Before, a control pointed at the message with `aria-errormessage` at most, which few screen readers read and which axe reports (`aria-valid-attr-value`). The alert reaches every field that shows the message; `aria-describedby` is set by `el-input-field`, `el-password-field`, `el-select-field`, `el-radio-field`, `el-textarea-field` and `el-switch-field`. ([#94](https://github.com/webtides/element-library/issues/94))
- Fixed: a field has its own stylesheet when its parent class was connected before it. element-js keeps the stylesheets of an element on its class, and a field found the ones of its parent class there and never built its own. On a page with an `el-input-field` before an `el-password-field`, the password field had the styles of the input field only, and its toggle looked like a native button; every field after an `el-form-field` had the styles of that one only. Each field class now has a place of its own for its stylesheets.

### input-field

- Added: `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<input>`, in server-rendered markup and on every render. Set them as attributes or properties on the element; one that is not set is left out on the `<input>`. Before, the field dropped them, so a password manager and the on-screen keyboard got no hints.
- Added: `size` (`small`, `medium` by default, `large`): the height, the padding and the font size of the control, 0.8 and 1.25 times `--el-control-height` for small and large. Reflected to the attribute. It shows once `styles/native.css` decorates the control; a control with the look of the browser keeps its size. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the input is at least `--el-touch-target` high (42 px with the default theme before), and the clear cross of an invalid field at least that wide and high (9 × 18 px before). The mark beside the input takes that width while the field is valid too, so the input keeps its width when the validity changes. Unchanged on a fine pointer and without the token.
- Fixed: the `hidden` attribute hides the field. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the input names it in `aria-describedby` while it is shown. Before, the input pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))

### notification

- Added: `close-label` (`closeLabel`): the accessible label of the close button, as on `el-dialog`. Default `'Close'`. Before, the label was fixed, so a screen reader announced the button in English on a page in another language. ([#98](https://github.com/webtides/element-library/issues/98))
- Changed: a notification that is already open when it is first rendered in the browser now appears without the enter transition, the same way a server-rendered one does. Opening it later (`show()`, `toast()`, setting `open`) still animates.
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the close button is at least `--el-touch-target` wide and high (18 × 18 px before). Its icon keeps its size, and a one-line notification grows with the button. Unchanged on a fine pointer and without the token.
- Fixed: a server-rendered open notification (Declarative Shadow DOM) is visible before its JavaScript runs, and stays visible without JavaScript. It used to be transparent until `connected()` added the `showing` class, and then faded in. A server-rendered closed notification no longer reserves its height before the element is connected. Until the element is connected the resting state follows the `open` attribute; afterwards `show()` / `hide()` / `toast()` animate as before.
- Fixed: the default variant icon is drawn again when the element is rendered in the browser (a toast, or a notification a framework creates after load). The icon shapes were a template nested inside the `<svg>`, which put them into the HTML namespace on client render, so the icon was an empty box; server-rendered notifications were not affected. Each variant now renders one complete `<svg>` template.

### password-field

- Added: `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<input>`, in server-rendered markup and on every render, the one the reveal toggle triggers included. Set them as attributes or properties on the element; one that is not set is left out on the `<input>`. Before, the field dropped them, so a password manager and the on-screen keyboard got no hints. `autocomplete="current-password"` and `autocomplete="new-password"` now reach the input.
- Added: `show-label` and `hide-label` (`showLabel`, `hideLabel`): the two accessible labels of the reveal button. Defaults `'Show password'` and `'Hide password'`, the texts that were fixed before. ([#98](https://github.com/webtides/element-library/issues/98))
- Added: `size` (`small`, `medium` by default, `large`), as on `el-input-field`. ([#69](https://github.com/webtides/element-library/issues/69))
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the reveal button is at least `--el-touch-target` wide and high (20 × 20 px before), the input at least that high, and the clear cross of an invalid field at least that wide and high. Unchanged on a fine pointer and without the token. Known limit: when an `el-input-field` connects before the first `el-password-field` of a page, element-js gives the password field the style sheet of the input field ([element-js#198](https://github.com/webtides/element-js/issues/198)). The reveal button then has none of its styles, this size included.
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the input names it in `aria-describedby` while it is shown. Before, the input pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- Fixed: the field has its own styles when an `el-input-field` is on the page before it. Before, it took over the stylesheet of the input field in that order and lost its own: the reveal button looked like a native button, with a border and a background. See `form-field`.
- Fixed: the `hidden` attribute hides the field. Before, the `display` of the element won over it. ([#69](https://github.com/webtides/element-library/issues/69))

### radio-field

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the label of every option, which is its hit area, is at least `--el-touch-target` wide and high. Before, it was as high as its line of text. Unchanged on a fine pointer and without the token.
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the group, like each of its radios, names it in `aria-describedby` while it is shown. Before, the group pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))

### select-field

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the select is at least `--el-touch-target` high (42 px with the default theme before). Unchanged on a fine pointer and without the token.
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the select names it in `aria-describedby` while it is shown. Before, the select pointed at it with `aria-errormessage` only. ([#94](https://github.com/webtides/element-library/issues/94))
- Fixed: a decorated select shows its chevron wherever the theme is loaded. The theme showed the field's own chevron with a rule of the same weight as the rule of the field that hides it, so the later one won: with the theme in the stylesheet of the page and the styles of the field after it, the select had no chevron at all, the native one taken away and its own hidden. The field now follows a property that `styles/native.css` sets. ([#69](https://github.com/webtides/element-library/issues/69))

### slider

- Added: `dot-label` (`dotLabel`): the accessible label of a pager dot, followed by the number of its item. Default `'Go to item'`, which names the dots "Go to item 1", "Go to item 2" and so on. ([#94](https://github.com/webtides/element-library/issues/94))
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the dots and the arrows are at least `--el-touch-target` wide and high (29 × 34 px and 41 × 40 px with the default theme before). The glyphs keep their size. The row of dots wraps when it gets wider than the slider. Unchanged on a fine pointer and without the token.
- Fixed: the pager dots have an accessible name (see `dot-label`); they were buttons without one (axe `button-name`). The scroller can be reached with the keyboard (`tabindex="0"`), where the arrow keys scroll it (axe `scrollable-region-focusable`). ([#94](https://github.com/webtides/element-library/issues/94))

### switch-field

- Changed: on a touch screen (`@media (any-pointer: coarse)`) the label, which is the hit area of the switch, is at least `--el-touch-target` wide and high. Before, it was as high as the switch. Unchanged on a fine pointer and without the token.
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the switch names it in `aria-describedby` while it is shown. Before, nothing connected the message with the switch. ([#94](https://github.com/webtides/element-library/issues/94))

### tab-group

- Added: keyboard support: the arrow keys move to the next and the previous link and select it, Home and End go to the first and the last one. Disabled links are skipped, and the arrow keys wrap around. Before, a tab could only be changed with a click. ([#97](https://github.com/webtides/element-library/issues/97))
- Added: `orientation` (`'horizontal'` by default, or `'vertical'`): which arrow keys move between the links, left and right or up and down. ([#97](https://github.com/webtides/element-library/issues/97))
- Added: the group tells assistive technology what its parts are: the selected link has `aria-selected="true"` and is the only link in the tab order (roving `tabindex`), every panel is labelled by its link (`aria-labelledby`; a link without an `id` gets one), and the element around the links gets `role="tablist"` and `aria-orientation`, unless the page gave it another role. ([#97](https://github.com/webtides/element-library/issues/97))
- Changed: put the links into an element of their own (for example a `<div>`), so that the group can make it the `tablist`. Links that are direct children of the group still work, with the keyboard too, but have no `tablist` around them, which axe reports (`aria-required-parent`). The group cannot be the list itself, because it holds the panels as well. ([#97](https://github.com/webtides/element-library/issues/97))
- Changed: the group no longer sets the `active` state on its links; it sets `aria-selected`, and `el-tab-link` takes its state from that. Nothing changes for `el-tab-link`. An element of your own that is used as a link (`link-selector`) no longer gets `:state(active)` from the group: style it with `[aria-selected='true']`. Before, such an element had to be an element-js element, any other made the group throw; now any element can be a link. ([#99](https://github.com/webtides/element-library/issues/99))
- Fixed: the group no longer throws when it connects before `el-tab-link` is defined (`TypeError: Cannot read properties of undefined (reading 'states')`), and the first selection reaches the links all the same. That order comes up with lazy definition, where each tag is loaded by itself. The group only writes attributes and styles now, which a link or a panel takes whether its tag is defined or not. ([#99](https://github.com/webtides/element-library/issues/99))
- Fixed: with no `selected` and panels that are not defined yet, the first panel is selected. The group read the `name` property, which a panel only has once it is defined, so every panel stayed hidden; it reads the attribute now. ([#99](https://github.com/webtides/element-library/issues/99))
- Fixed: links and panels that are added to the group later are taken in: they get their states, a new panel is labelled by its link, and a group that had no panel at first selects the first one that comes. Before, the group looked for its parts once, when it connected. ([#99](https://github.com/webtides/element-library/issues/99))

### tab-link

- Added: the link is a tab: it has `role="tab"`, and Enter and Space select it like a click does. In an `el-tab-group` it carries `aria-selected`, and only the selected link is in the tab order. Before, it had no role and reacted to a click only. A role the page sets itself is kept. ([#97](https://github.com/webtides/element-library/issues/97))
- Added: a focus ring from the library's tokens (`--el-focus-ring-width`, `--el-color-focus-ring`, `--el-focus-ring-offset`) while the link has the keyboard focus. ([#97](https://github.com/webtides/element-library/issues/97))
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the tab is at least `--el-touch-target` wide and high (36 px high with the default theme before). Unchanged on a fine pointer and without the token.
- Changed: the link sets its `active` state itself, while it has `aria-selected="true"`. Before, the `el-tab-group` set the state from outside, which failed when the link was not defined yet. In a group nothing changes: the group keeps `aria-selected` up to date. A link outside a group is active while the page sets `aria-selected="true"` on it. ([#99](https://github.com/webtides/element-library/issues/99))
- Fixed: a disabled link is exposed as disabled: the element sets `aria-disabled="true"` on itself while it has the `disabled` attribute. Before, it was only greyed out, and axe counted the reduced contrast as a failure. ([#94](https://github.com/webtides/element-library/issues/94))

### tab-panel

- Added: the panel has `role="tabpanel"`, and its `el-tab-group` labels it by its link (`aria-labelledby`). A role the page sets itself is kept. ([#97](https://github.com/webtides/element-library/issues/97))

### textarea-field

- Added: `autocomplete`, `inputmode`, `enterkeyhint`, `autocapitalize`, `autocorrect` and `spellcheck` are passed on to the native `<textarea>`, in server-rendered markup and on every render. Set them as attributes or properties on the element; one that is not set is left out on the `<textarea>`. Before, the field dropped them.
- Changed: on a touch screen (`@media (any-pointer: coarse)`) the textarea is at least `--el-touch-target` high, which matters for `rows="1"`, and the clear cross of an invalid field at least that wide and high (9 × 18 px before). Unchanged on a fine pointer and without the token.
- Fixed: a server-rendered `el-textarea-field` shows its value before its JavaScript runs, and without JavaScript. The value is now rendered as the content of the `<textarea>`; before, it was written as a `value` attribute, which a textarea does not have, so the field stayed empty and submitting the form sent an empty text. Known limit: a line break at the very start of the value is missing until the element has started, because the HTML parser drops a line break that directly follows `<textarea>`.
- Fixed: a re-render no longer overwrites text typed since the last change the field has seen. Before, every render wrote `value` back into the control.
- Fixed: `aria-describedby` on the textarea now names the help message (`<name>-help-message`). It pointed at `<name>-help`, an id that does not exist.
- Fixed: the error message is announced by screen readers: it is an alert (`role="alert"`), and the textarea names it in `aria-describedby` while it is shown. Before, nothing connected the message with the textarea. ([#94](https://github.com/webtides/element-library/issues/94))

## [0.2.0] - 2026-06-10

### Packaging

- Added: a new `@webtides/element-library/catalog` export — the recommended way to consume this library under **server-side rendering** with `@webtides/element-js-ssr-renderer`. `catalog.js` is a generated, bundler-traceable `Catalog` (`{ "el-button": () => import("./src/components/button/button.js"), … }`) covering all 26 components. Because it ships **inside the package**, its specifiers are package-internal relative paths that resolve in any consumer's bundle regardless of `node_modules` layout, so SSR works on every target (plain Node, Nitro, edge/Workers, webpack, Vite) with no consumer codegen and no hand-written import map: `import catalog from "@webtides/element-library/catalog"` then pass it to the renderer's `resolve`. Distinct from `./all` (a client-side side-effect bundle that registers every component for hydration) — the catalog defines nothing and runs no `define()`, it only tells the SSR renderer how to load each class. Regenerated automatically on release via the `prepack` hook (and on demand with `npm run gen:catalog`), so it can never drift from the components; a Node SSR smoke test (`npm run test:catalog`, run in CI) verifies a known tag still resolves to its class through the renderer.

## [0.1.2] - 2026-06-04

### Packaging

- Fixed: the published tarball now ships the runtime `src/utils/*.js` files. The `files` allowlist in `package.json` included `src/components/**/*.js` but not `src/utils/**/*.js`, so `0.1.1` shipped only the `types/src/utils/*.d.ts` declarations while the runtime modules were dropped. Components that import them — `el-notification` and `el-dialog` (`../../utils/transitions.js`, `../../utils/body-scroll.js`) — failed to resolve those imports from the published package, breaking downstream builds (e.g. `nuxt build`). This is independent of the `patch-package` `postinstall` fix in `0.1.1`.

## [0.1.1] - 2026-06-04

### Packaging

- Fixed: a clean `npm install @webtides/element-library` no longer fails. `0.1.0` ran `"postinstall": "patch-package"` without shipping `patch-package`, so consumers without it on `PATH` got `sh: patch-package: command not found` (exit 127) and the install aborted. The `postinstall` hook, the `patch-package` devDependency, and the `patches/` directory have all been removed.

### Components

- Fixed (`el-carousel`): the carousel now bundles in consumer projects. It deep-imports Glide's `src/components/html.js`, whose pristine source imports a non-existent `exist` export — which `esbuild`/Vite reject as a hard build error. `0.1.0` "fixed" this with a `patch-package` patch applied via `postinstall`, but a dependency's `postinstall` runs from its own nested directory and can never reach the consumer's hoisted `@glidejs/glide`, so the patch never applied downstream. The fixed Glide `html.js` component is now vendored into the carousel (`glide/components/glide-html.js`) instead, removing the dependency on patching consumers' `node_modules`.

## [0.1.0] - 2026-06-03

### Components

- Added: new `el-button` component — a themeable button (variants, sizes, outline/pill/circle, caret, loading, prefix/suffix slots, link mode).
- Added: new `el-dialog` component — a modal dialog built on the native `<dialog>` element (platform-provided focus trap, background `inert`, focus restore and `<form method="dialog">` auto-close), with an animated, cancelable open/close lifecycle and ref-counted body-scroll locking that compensates for the removed scrollbar width (no layout shift on open).
- Added: new `el-notification` component — an alert/notification that can be shown inline or as a transient toast (`toast()` floats it into a shared top-right stack). Semantic variants, optional close button, optional auto-dismiss that pauses on hover/focus, and an ARIA live-region host (`role="alert"` for danger/warning, `role="status"` otherwise).
- Added: new `el-radio-field` component — a single-choice radio group extending `FormField`, rendering a native `<fieldset>`/`<legend>` of mutually-exclusive radios from an `options` array (strings or `{ value, label?, disabled? }`) with a custom, headless-by-default indicator. Inherits the `input-change` event and `touched`/`valid`/`invalid` states.
- Added: new `el-switch-field` component — an on/off toggle extending `FormField`, rendering a native `<input type="checkbox">` with `role="switch"` behind a custom, headless-by-default track/thumb. Reflects `checked`, adds a `checked` custom state, and inherits the `input-change` event and `touched`/`valid`/`invalid` states.
- Added: new `el-password-field` component — a masked password input extending `InputField`, pinning the input `type` to `password` (flipping to `text` while revealed) and adding an optional show/hide reveal button (`password-toggle`, default on). Inherits the `input-change` event and `touched`/`valid`/`invalid` states. All three shipped themes decorate its native input identically to `el-input-field`, so themed password and text fields match.
- Changed (BREAKING): dropped the `-element` suffix from five components. The tags `el-accordion-element / el-carousel-element / el-dropdown-element / el-slider-element / el-sticky-element` are now `el-accordion / el-carousel / el-dropdown / el-slider / el-sticky`; their import subpaths (`@webtides/element-library/<name>` and `/<name>/define`) and exported classes (`AccordionElement → Accordion`, `CarouselElement → Carousel`, `DropdownElement → Dropdown`, `SliderElement → Slider`, `StickyElement → Sticky`) change to match. `accordion-group` is unchanged.

### Theming

- Added: dialog tokens (`--el-dialog-width`, `--el-dialog-overlay-background`) wired into all three shipped themes (default / high-contrast / sketchy), so themed `el-dialog`s get a visible, per-theme overlay scrim. Unthemed dialogs keep a `transparent` backdrop (headless). Documented in the Storybook _Docs / Theming_ token reference.
- Added: opt-in default theme stylesheet at `@webtides/element-library/themes/default.css`. Defines the `--el-*` token vocabulary at `:root` with `light-dark()` color values; without it imported, components stay headless.
- Added: opt-in high-contrast theme stylesheet at `@webtides/element-library/themes/high-contrast.css`. Same token contract, accessibility-leaning identity: near-black/white surfaces, 2px borders, 3px focus rings, no shadows, larger touch targets. Supports both color schemes via `light-dark()`.
- Added: Storybook toolbar gains a "Theme" switch (None / Default / High contrast) and a "Color scheme" switch (System / Light / Dark) for previewing themed and unthemed states.
- Added: Theming docs page in Storybook (`Docs / Theming`) covering the headless philosophy, themes vs color schemes, the full `--el-*` token reference, and a recipe for writing custom themes. README gains a short Theming section pointing at it.
- Added: both shipped themes respect `prefers-reduced-motion: reduce` (collapses `--el-duration-md` to `0s`). Default theme also responds to `prefers-contrast: more` (bumps fg/border to pure black/white, raises border-width to 2px and focus-ring-width to 3px). High-contrast theme is already at its contrast ceiling.
- Added: both shipped themes suppress the native `<select>` chevron and position `el-select-field`'s `.dropdown-indicator` over the right edge, so themed selects show a single, theme-colored glyph instead of duplicating the native one. Unthemed selects still render the native chevron with the custom indicator hidden — no double chevron either way.
- Added: Storybook preview decorator mirrors the active theme's `--el-color-bg` / `--el-color-fg` onto the iframe `<body>`, so flipping Theme or Color scheme also flips the page background. Stays inside Storybook; doesn't leak into consumer themes.
- Changed: `el-dropdown` panel now reads `--el-shadow-lg` and `--el-radius-lg` (previously `-md`). Floating surfaces conventionally use more pronounced elevation. Themes that already set both tokens get the upgrade automatically.
- Changed: expanded token-driven surfaces across components so the theme toggle is actually visible — dropdown panel, accordion title/content padding + divider, checkbox indicator + accent, tab-link active accent + hover, tab-group bottom border, form-field label margin/color, amount-field wrapper border + button/input padding. All fallbacks are null-ish (`0` widths, `transparent` colors, `none` shadows) so unthemed components remain headless.
- Changed: default theme decorates native form controls (`input`, `textarea`, `select`) directly via component selectors, since those live in light DOM and can't be safely overridden from component CSS without losing the native unthemed look.
- Changed: slider fallbacks for dot color and arrow background are now `currentColor` / `transparent` instead of `#333` / `white` — unthemed slider matches surrounding text instead of imposing a light-mode-assuming palette.
- Changed: both themes render native form controls (`input`, `textarea`, `select`) full-width (`width: 100%; box-sizing: border-box`), so themed forms are consistent and the select's custom chevron sits flush at the control's right edge.

### accordion

- Added: `open` custom state on the host (`:host(:state(open))`).
- Changed (BREAKING): renamed CSS parts `title-wrapper` → `title` and `content-wrapper` → `content`; the internal `.content-wrapper` class is now `.content`.
- Changed (BREAKING): replaced the `open-icon` / `close-icon` parts with a single `icon` part — one SVG chevron that rotates 180° when open — instead of two `&vee;` / `&wedge;` text glyphs.
- Changed: internal style now uses `:host(:state(open))` instead of `:host([open='true'])`. The reflected `open` attribute is unchanged.
- Changed: expand/collapse transition is token-driven (`--el-duration-md`, `--el-ease`).
- Fixed: collapsed content no longer leaves a padding-sized sliver — the `.content` padding moved to an inner `.content-inner` wrapper so closing the accordion clips it. Only surfaced once a theme set `--el-space-3`.

### accordion-group

- Fixed: single-open mode (`show-multiple="false"`) now correctly closes the previously open accordion when one starts open declaratively. The `connected()` preselection scan had an inverted guard (it ran only in multi-open mode) and queried the whole document instead of the group's own children.

### carousel

- Fixed: `ShadowHtml` now forwards Glide's `Events` argument to the wrapped html component (like the other `Shadow*` wrappers). It previously called the factory with `(Glide, Components)` only, so `Events.on('update', …)` threw `Cannot read properties of undefined (reading 'on')` on every mount.
- Fixed: Glide's core + theme CSS is inlined into the component style instead of `@import`-ed. The `@import` was dropped inside the shadow-DOM adopted stylesheet, so arrows/bullets weren't positioned over the slides (they appeared as a strip below the image) and the track wasn't clipped.

### checkbox-field

- Added: `checked` custom state on the host. Inherits the `touched / valid / invalid` states from `FormField`.
- Fixed: the native `<input type="checkbox">` is now visually hidden (still focusable / in the a11y tree) instead of rendering a second box next to the custom indicator; the duplicated label is gone (the base `FormField` label is suppressed in favour of the inline one). `.checked-indicator` gained `currentColor` fallbacks so unthemed checkboxes stay visible, plus `:focus-visible` styling.

### dropdown

- Added: `open` custom state on the host.

### form-field

- Added: host-level `touched`, `valid` and `invalid` custom states. Inherited by all field subclasses. The inner `.field.is-*` classes still exist for internal use.

### input-field

- Changed: hardcoded values now reference design tokens (`--el-space-*`, `--el-color-success`, `--el-color-danger`, `--el-font-size-sm`) with the previous values as fallbacks.
- Fixed: the `pattern` attribute is now omitted when unset (via element-js's `optionalAttribute` directive) instead of falling back to a `[sS]*` regex that matched only runs of `s` / `S` and so rejected any ordinary value as invalid.

### lazy-src

- Added: `loaded` custom state on the host (alongside the existing reflected `loaded` attribute).

### select-field

- Changed (BREAKING): renamed the dropdown indicator's CSS class from `.icon` to `.dropdown-indicator`.
- Changed: the `.dropdown-indicator` renders an SVG chevron (`currentColor`) instead of the `&or;` text glyph. Still hidden by default; themes show and position it.

### slider

- Changed: hardcoded colors and paddings now reference design tokens (`--el-color-fg`, `--el-color-bg`, `--el-space-*`). Color fallbacks use `light-dark()` so unthemed dark mode renders sensibly.

### sticky

- Changed (BREAKING): replaced the `.is-sticky / .is-up / .is-down` host classes with the custom states `:state(sticky) / :state(up) / :state(down)`.
- Changed: sticky transition is token-driven (`--el-duration-md`, `--el-ease`).

### tab-group

- Changed: selection is mirrored onto child `<el-tab-link>` elements via the `active` custom state instead of the `[active]` attribute.

### tab-link

- Changed (BREAKING): the active state is now exposed as `:state(active)` instead of `[active]`.

## [0.1.0] - TBD

Initial public release on npm under the consolidated single-package layout.

Pre-merge per-component release history is preserved in each component's `*.changelog.md` under the "Legacy (pre-merge)" heading.

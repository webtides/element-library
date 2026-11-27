# CLAUDE.MD

This document provides context for AI assistants working with the `@webtides/element-library` codebase.

## Project Overview

`@webtides/element-library` is a collection of web components built with `@webtides/element-js`. The library provides pre-built custom elements with a focus on performance and accessibility.

- **Repository**: https://github.com/webtides/element-library
- **License**: MIT
- **Version**: 0.4.0
- **Status**: Work in progress - subject to breaking changes until 1.0 release

## Technology Stack

- **Framework**: `@webtides/element-js` (^1.3.1)
- **Toolchain**: Vite+ (`vite-plus`, local `vp` CLI) bundles Vite, Vitest, Oxlint and Oxfmt
- **Build Tool**: Vite 8 (via Storybook; uses Rolldown bundler)
- **Testing**: Vitest 5 via `vp test` (with browser mode and custom test helpers)
- **Documentation**: Storybook 10.x
- **Linting**: Oxlint (`vp lint`) + Oxfmt (`vp fmt`), configured in `vite.config.ts`
- **Manifest**: `npm run analyze` writes `custom-elements.json` and `web-types.json` (both gitignored). The `prettier` dev dependency exists only for this step: the web-types generator `custom-element-jet-brains-integration` needs it as a peer. Do not remove it — without it the manifest config fails to import and `cem analyze` silently falls back to defaults (see the comment in `custom-elements-manifest.config.mjs`)
- **Node**: development needs 22.18+ (Vite+ requirement, see `.nvmrc`); consumers need 20.19+ (`engines.node`)
- **External Dependencies**:
    - `@glidejs/glide` for carousel functionality (pinned at `~3.6.2`; patched via `patch-package`)
    - `lozad` for lazy loading
    - `@floating-ui/dom` for the place of the popover's panel and of the tooltip (through `src/utils/floating.js`)

## Project Structure

```
element-library/
├── src/
│   └── components/        # All web components
│       └── [component-name]/
│           ├── [component-name].js              # Class + define() function (no side effects)
│           ├── [component-name].define.js       # Side-effect entry: calls define()
│           ├── [component-name].style.js        # Component styles
│           ├── [component-name].events.js       # Event constants (optional)
│           ├── [component-name].stories.js      # Storybook stories
│           ├── [component-name].readme.md       # Component documentation
│           ├── [component-name].changelog.md    # Component changelog
│           ├── [component-name].test.unit.js    # Unit tests
│           └── [component-name].test.feature.js # Feature tests
│   ├── styles/            # Shared style modules (*.style.js) and opt-in stylesheets (native.css, utilities.css, layers.css)
│   ├── themes/            # Opt-in themes: the --el-* tokens at :root, nothing that decorates a control
│   └── utils/             # Shared runtime helpers
├── .storybook/           # Storybook configuration
├── patches/              # patch-package patches (Glide deep-import fix)
├── all.js                # Side-effect entry: registers every component
├── index.js              # Pure re-export of element-js base classes
└── package.json
```

## Available Components

### Implemented Components

- **accordion**: Single accordion element
- **accordion-group**: Accordion group container
- **amount-field**: Amount stepping input field
- **app-bar**: Bar at the top of a view: a start, a title that is cut with an ellipsis and can be the heading of the view (`heading-level`), and actions at its end; in the header of an `el-app-frame` its surface reaches under the status bar of a phone
- **app-frame**: Frame of an application: it fills the viewport and lays out a header, a footer, a navigation, an aside and the content, which scrolls; the page writes the landmarks, the stylesheet decides narrow or wide by the width of the frame (a container query per step of `wide-from`), and the regions keep clear of the notch and the home indicator; `narrow-only` and `wide-only` name the regions that are there at one width only; where the frame is narrow the navigation is in an `el-drawer` of the frame (one slot, rendered in the region or in the drawer), opened by any element with `data-navigation-toggle`; with `narrow-navigation="bar"` the navigation lies at the lower edge instead, for an `el-nav`; `resizable` names the columns whose width the user sets by dragging their edge (an `el-splitter` of the frame, there once the script runs), `navigation-size` and `aside-size` are those widths in pixels (written onto the grid from the template, so a server-rendered frame has a kept width), and the stylesheet holds their limits (`--el-app-frame-navigation-min-size`, `-max-size`, the same for the aside); where a browser lays its on-screen keyboard over the page, the script makes the frame as high as what shows above it and puts it where that part is (`window.visualViewport`, `:state(keyboard)`): a visual viewport that is lower than the layout is a keyboard only while the user types into something (a field, a text they edit or an `iframe` has the focus), as Safari on iOS shows less while a finger pulls the page past its top as well; and it scrolls the field the user types into back into view when its region gets less high; with `status-bar-tap` a tap on the status bar of an iPhone brings the content to its top: the script makes the document one pixel higher than the viewport (a sentinel element in the body) and lets it snap to that pixel (`scroll-snap-type` on `html`, off while a keyboard is there), so no script of the page scrolls it and a router is no tap; a scroll to zero that is the first thing the document at rest does is the tap, unless a finger, a wheel, a key, a keyboard or a change of the viewport moved the document; the frame fires `app-frame-status-bar-tap` (cancelable), scrolls `scroller`, and puts the document back on its pixel once that scroll is over (`scrollend`): iOS takes it back to the top for as long
- **avatar**: Picture of a person or a thing: an image, initials or an icon
- **badge**: Label for a status or a count
- **breadcrumb**: Trail from the start page to the current page: a `nav` landmark with a list of `el-breadcrumb-item`
- **breadcrumb-item**: One entry of a breadcrumb: a link with `href`, text without, with the separator in front of it
- **button**: Themeable button
- **button-group**: Row of `el-button` that reads as one control: joined corners, a line between neighbours, a group with a name
- **card**: Surface that groups content, with media, header, body and footer regions
- **carousel**: Carousel wrapper for glide.js
- **checkbox-field**: Checkbox input
- **checkbox-group-field**: Choice of any number of options: a native `<fieldset>` with a checkbox per entry of `options`, under one name
- **color-field**: Colour for a form: a native `<input type="color">` with the label and the messages of a field, the value as text beside it and colours for its picker to offer
- **combobox-field**: Text with suggestions the browser offers while the user types: an input field with a native `<datalist>` from `options` (free text, not a choice)
- **copy-button**: Button that copies a text to the clipboard and says whether that worked
- **date-field**: Date, time or both in the control of the browser (extends the input field): `type` `date`, `time`, `datetime-local`, `month` or `week`, with `min`, `max` and `step`
- **description-list**: Rows of a name and its value: a native `<dl>` in the shadow root, with the `<dt>` and `<dd>` of the page slotted into it; stacked below 30rem of its own width, side by side from there
- **dialog**: Modal dialog built on the native `<dialog>` element
- **divider**: Line between two groups of content, horizontal or vertical
- **drawer**: Panel that slides in from an edge of the viewport (extends the dialog)
- **dropdown**: Panel in the flow of the page that a trigger shows and hides; no menu (that is `el-menu`) and no floating panel (that is `el-popover`)
- **empty-state**: Message in the place of a list that is empty, with an optional action
- **file-field**: One or several files for a form: a native `<input type="file">` with the label and the messages of a field; with `drop-message` an area to drop a file onto, around the control: a drop sets the files of the control and fires `input` and `change` on it, so it is a choice as one in the dialog, and the field asks itself what `accept` and `multiple` let through (the browser does not for a drop)
- **form-field**: Base form field
- **input-field**: Text input field
- **lazy-src**: Lazy loading wrapper
- **list**: List of rows: `role="list"`, one density, a line between two rows, and one line where the texts of all rows begin (subgrid)
- **list-item**: One row of a list: a start, a title, a line under it, an end and a control of its own; a link as a whole with `href`
- **menu**: Menu button: a button of the page (`trigger` slot) opens a list of actions, `el-menu-item` elements; the panel is the menu (`role="menu"`, named by `label` or by its button) and a popover the menu opens and closes itself (`popover="manual"`: a press beside it, `Escape`, another menu), placed with Floating UI (`placement`, `bottom-start` by default); the button gets `aria-haspopup="menu"` and `aria-expanded` from the script; the arrow keys, `Home`, `End` and a first letter move the focus through the entries (roving, the entries are out of the Tab order), `Escape` gives the focus back, the Tab key closes and moves on; the menu hears its keys at the window while it is open, so `Escape`, the Tab key and the arrow keys are its own wherever the focus is, and a press beside the entries leaves the focus on the entry that had it (the panel has `tabindex="-1"`); entries that come or are defined after the menu has opened get the focus once they are there; choosing an entry is a click on it, closes the menu and fires `menu-select` (`detail.item`, `detail.value`); a press on its own button, or on the element it is open at, does not close it when the pointer goes down but with the click (the `showAt()` the page calls with that click closes it, so the button of a row needs no listener of its own for it); `showAt(place, opener)` opens the one menu of a list for a row, at a point of the viewport (a right click, a long press) or at an element (the button of the row), and `opener` is what it was opened for: it gets the focus back and is `detail.opener`; at a point the menu is placed once and closes when a region around its opener or the page scrolls (it listens on each of them, `scrollersOf()` in `src/utils/floating.js`: a scroll does not leave a shadow root), and the focus goes back without scrolling (`preventScroll`)
- **menu-group**: Group of entries in a menu: `role="group"` with `label` as its heading and its name, and a line over it unless it is the first thing in the menu (`:nth-child(1 of :not([slot]))`, as the button of the menu is a child as well)
- **menu-item**: One entry of a menu: a `<button role="menuitem">`, or a link with `href`; `value` for the listener of `menu-select`; `disabled` says so with `aria-disabled`, keeps its click to itself and stays reachable by the keyboard; an `icon` slot in front of the text; `variant="danger"` from the shared variants; with `type="checkbox"` or `type="radio"` it is a `menuitemcheckbox` or a `menuitemradio` that says `checked` (`aria-checked`) and shows it with a mark whose place is there while it is not checked as well; the page sets `checked`, the entry and the menu do not
- **nav**: Destinations of an application: a `nav` landmark with a list of `el-nav-item`, as a bar for the lower edge of a phone (three to five in equal parts), as a rail for the side of a wider screen (icons alone with tooltips), or as a list for a sidebar (an icon and its text in a row, as wide as its place); a rail and a list have a group at their top and one at their lower end (`end`), and a second group under a heading (`secondary`, `secondary-label`) that a bar leaves out; `layout="auto"` is a bar, and in the column of an `el-app-frame`, which says so in an inherited property, what `column` names (`rail` or `list`): a class of the landmark, so a server decides per view; in an element of the page in the `navigation` slot it takes the same layout, and the height that is left in a flex column of that element
- **nav-item**: One destination of a nav: a link with an icon, a short text under it and a count or a dot; the current one is marked by its weight and a shape behind its icon; as a row of a list the text is beside the icon, the shape is behind the whole row and the count is at its end (the `el-nav` says which in inherited properties)
- **scroll-to**: Scroll to target element
- **notification**: Alert with variants, auto-dismiss and a live region, inline or as a toast
- **otp-field**: One-time code of a second factor: one native input (extends the input field) that takes spaces and hyphens out and says when the code is complete
- **pagination**: Way through a list that is split into pages: a `nav` with a button per page; with `href`, the address of a page with `{page}` in the place of its number, the pages are links in the server-rendered markup (the way that leads nowhere at an end is a link without an address, `role="link"` and `aria-disabled`), and a link fires nothing
- **password-field**: Masked password input with an optional show/hide toggle
- **popover**: Panel that floats next to an anchor (native popover, placed with Floating UI)
- **progress-bar**: Track that fills with the progress of a task, or moves while the progress is not known
- **progress-ring**: Ring that closes with the progress of a task, with room for a short text in its middle
- **radio-field**: Single-choice radio group: a native `<fieldset>` with a radio per entry of `options`
- **range-field**: Number from a span, picked with the thumb of a native `<input type="range">`
- **rating-field**: Rating from 1 to `max` as a row of stars: a native radio group in a `<fieldset>`
- **scroll-to-top**: Scroll to top button
- **segmented-field**: One choice of a few options as a row of joined buttons (extends the radio field): native radios in a `<fieldset>`, with the look of a button group
- **select-field**: Select dropdown
- **skeleton**: Shape in the place of content that is still loading
- **slider**: CSS-only slider
- **spinner**: Spinner for a wait of unknown length
- **splitter**: Edge between two panes that are beside each other, which the user drags to set the width of one of them: a separator with a value (`role="separator"`, the width in pixels between `min` and `max`), dragged with a mouse, a finger or a pen and moved with the arrow keys, `Home` and `End`; it is the control and sizes nothing itself (`splitter-resize`, `splitter-resize-end`), the layout around it takes the value; while it is dragged it captures the pointer and covers the viewport, so an `iframe` does not take the pointer away
- **status-bar**: Narrow line of state at the lower edge of a tool for a desktop: entries at its start and at its end in one row that keeps its height (lower than a control), no live region (the page marks an entry with `role="status"`); what does not fit is cut at the end of the start group; it tells an `el-button` in it its height, its text, `plain` and a focus ring inside (inherited properties); in the footer of an `el-app-frame` its surface reaches the lower edge of the screen
- **sticky**: Sticky positioning element
- **svg-use**: SVG icon element
- **switch-field**: On/off toggle backed by a native checkbox with `role="switch"`
- **tab-group**: Tab container
- **tab-link**: Individual tab link
- **tab-panel**: Tab content panel
- **tag**: Label for a keyword or a filter, removable
- **tag-field**: List of short texts the user writes: a text input that turns what is entered into `el-tag` entries under one name
- **textarea-field**: Textarea input
- **toast**: Region where toasts appear: a stack of notifications at an edge of the viewport (a native popover while it has toasts), with `toast()` to show one
- **toolbar**: Row of controls over a list or a view: `role="toolbar"`, one size and one appearance for its controls (inherited CSS properties), the arrow keys between them, a group at the end, tooltips for the buttons with an icon alone
- **tooltip**: Text that explains its anchor, on hover and keyboard focus (the element is a native popover, placed with Floating UI)
- **transition-classes**: CSS transition helper
- **tree**: Entries that open and close: nested lists of links (`role="list"`, no `role="tree"`) with a button per branch, and the arrow keys of the tree view pattern from the script
- **tree-item**: One entry of a tree and the entries below it: an icon, its name, a count; a link with `href`; `open` as an attribute the stylesheet reads

### Planned Components

See README.md for full list of components in planning/TBD status.

## Consumption Patterns

Consumers can import from the package in three ways:

```js
// Pure class import — no side effects, tree-shakable
import Accordion from '@webtides/element-library/accordion';

// Side-effect import — registers a single custom element
import '@webtides/element-library/accordion/define';

// Side-effect import — registers all components (client-side, for hydration)
import '@webtides/element-library/all';

// Server-side rendering — a lazy Catalog of every component, for the renderer's `resolve`
import catalog from '@webtides/element-library/catalog';
```

The exports map in `package.json` exposes:

- `.` → `index.js` (re-exports element-js base classes; no side effects)
- `./all` → `all.js` (imports every component's `*.define.js`)
- `./catalog` → `catalog.js` (a generated `{ tag: () => import(...) }` map for SSR — see below), typed by the hand-written `catalog.d.ts`
- `./*` → `src/components/*/*.js` (the component module — class + `define()` function, no side effects)
- `./*/define` → `src/components/*/*.define.js` (calls `define()` for that one component)

The `sideEffects` field marks only `./all.js` and `./src/components/*/*.define.js` as side-effectful so bundlers tree-shake everything else. (`./catalog` is intentionally **not** side-effectful — it is a plain map of lazy importers, so unused loaders tree-shake away.)

### `./catalog` — SSR (the opposite end of `./all`)

`./catalog` is for **server-side rendering** with [`@webtides/element-js-ssr-renderer`](https://github.com/webtides/element-js-ssr-renderer): a `Catalog` — `{ "el-button": () => import("./src/components/button/button.js"), … }` — that the renderer's `resolve` option consumes to pre-render the components present on a page to Declarative Shadow DOM. It is the mirror image of `./all`:

|  | `./all` | `./catalog` |
| --- | --- | --- |
| Side | client (browser) | server (SSR) |
| Effect | side-effectful: `define()`s every component for hydration | a plain value; defines nothing, runs no `customElements.define` |
| Loading | eager (all components) | lazy (only tags on the page) |

A consumer doing SSR uses **both**: `./catalog` on the server to pre-render, and `./all` (or per-component `…/define`) on the client to hydrate. Because the catalog ships inside the package, its specifiers are package-internal relative paths that resolve in any consumer bundle regardless of `node_modules` layout — no consumer codegen, no hand-written import map.

`catalog.js` is **generated, not hand-edited** — regenerate it from the CEM with `npm run gen:catalog` whenever components are added or removed. Like `custom-elements.json`/`web-types.json`, it is **gitignored** (not committed) but shipped via the `files` allowlist, and the `prepack` hook regenerates it on every release so it can't drift from the components. The `test:catalog` script (a Node SSR smoke test, run in CI) renders a known tag through the renderer's `resolve` to verify the catalog actually resolves to component classes. It then compiles `test/catalog.types.ts`, which imports the export by package name under `strict`, to verify that a TypeScript consumer gets a typed default export. The smoke test also checks `custom-elements.json` itself: every type in it is a TypeScript type, every attribute and every event of an element has one, and a component has the type it gives to what it inherits (by the example of `el-tag-field`). The config of the manifest repairs two things the analyzer gets wrong there: the type of a parameter with nested `@param` tags, and the type of a superclass written over the one of the class. It also hands the files to the analyzer in the order of their paths (`overrideModuleCreation`): the analyzer finds them in another order with every run, and the smoke test checks that the modules of the manifest are sorted. To compare two manifests from before that, compare by the names of the entries.

`catalog.d.ts` is the one hand-written, committed file of the pair: it types the default export structurally as a map from tag to lazy loader, without importing from the renderer (which ships no declarations).

## Development Conventions

### Component Structure

All components follow this pattern:

1. **File naming**: Use kebab-case matching the component name
2. **Class naming**: Use PascalCase for the JavaScript class
3. **Custom element tag**: Use kebab-case for HTML tag names
4. **Each component has**:
    - Main `.js` file with class + `define()` function (no side effects on import)
    - `.define.js` side-effect entry that calls `define()`
    - `.style.js` file for CSS-in-JS styles
    - `.stories.js` file for Storybook documentation
    - `.readme.md` for component documentation
    - `.changelog.md` per-component changelog
    - `.test.unit.js` for unit tests
    - `.test.feature.js` for feature/integration tests
    - Optional `.events.js` for event constants

### Shared Style Modules

`src/styles/` holds the style a component shares with others. A component composes the modules into its own `*.style.js` instead of carrying a copy (see `button.style.js` and `input-field.style.js`):

```js
export default [hostStyle(), sizeStyle(), variantsStyle(), appearanceStyle('.button'), style].join('\n');
```

- **`host`**: the `hidden` attribute, and `box-sizing: border-box` inside a shadow root.
- **`size`**: resolves the `size` attribute (`small` / `medium` / `large`) to internal properties. `sizeContextStyle()` is the other side: a container (`el-toolbar`) says its size to the controls inside of it, in inherited properties (`--_el-context-size-*`).
- **`variants`**: resolves the `variant` attribute (`neutral` / `brand` / `success` / `warning` / `danger`) to the colours of five roles.
- **`appearance`**: paints those colours on a surface as `filled`, `outlined` or `plain`. `appearanceContextStyle()` is the other side for a container: one inherited switch per appearance (`--_el-context-appearance-plain`, `-outlined`), set to nothing or not set.
- **`form-control`**: the layout of a field around its control (label, help, `.field`, error) and the look of those texts. Every field renders into the page and composes it for its own tag, together with `host`; `form-field.style.js` is the stylesheet of `el-form-field` alone. Every rule of the module names the host itself: a rule nested in `:host` does not reach into a shadow root in every browser that knows nesting, should a field compose it for one. A subclass does not get the stylesheet of its parent class (its `styles` replace it), and a rule for the tag of another field reaches that field only on a page that has both. The mark of a touched field (`.validity`) does not add to the height of the row: a negative margin gives the height of its line back, so a field is as high after it was left as before.
- **`choice-group`**: a group of choices in a field (`el-radio-field`, `el-checkbox-group-field`, `el-rating-field`, `el-segmented-field`): the fieldset as the column of the field, an option (`.option`) as the label and hit area of its native radio or checkbox, and that control hidden from the eye, with the keyboard focus on the element after it. The layout of `.options` and what is drawn in the place of a control stay with the field. An option of `el-radio-field` and `el-checkbox-group-field` can have something in front of its label, a dot in a `color` it names and an `icon` (the address of an SVG symbol): `optionStartTemplate()` in `src/utils/options.js` renders it, hidden from assistive technology, and the module has its look.
- **`arrow`**: the arrow of a floating surface (popover, tooltip), on the edge that faces the anchor. Its argument is the surface, not the host; `placeAtAnchor()` in `src/utils/floating.js` sets the `data-placement` it selects by. Only the two sides of the arrow that stick out have a border. The other two have no width: a transparent colour would be replaced when a user forces colours.
- **`slide-controls`**: the arrows and the dots of a component that shows a part of its content at a time (`el-carousel`, `el-slider`), selected by their parts (`arrows`, `arrow`, `dots`, `dot`, `selected-dot`). Its arguments are the element that has the track and the controls as children, the track, and what marks an arrow that leads nowhere beside `:disabled`. It lays that element out as a grid: the track with the arrows on it, and the dots in a row under it. The dots are on the page because nothing says what a slide shows; the arrows lie on the track with a surface of their own, their focus ring inside of it, and a disabled one keeps its surface (an arrow that fades as a whole lets the slide show through). A dot is small and takes a click in a square around it (`--_el-dot-target`).
- **`input-control`**: the control of a text field that has more in it than its input (`el-input-field` and the fields that extend it): `.control` is the row with the input in its middle, the content of the page at its start and its end (`.control-start`, `.control-end`) and the button that clears it (`.control-clear`). The field renders the row only while there is such content or the field is `clearable`; without it the markup is the input alone, as before. The page hands the content over as children with `slot="start"` and `slot="end"`: a field has no shadow root, so its template takes the elements in (the nodes themselves in a browser, their markup on a server, where the lifecycle has not run). The module is the layout; that the row is the control to the eye is the part of `native.css`.
- **`modal`**: a native `<dialog>` as a modal surface with a header, a body and a footer (dialog, drawer): the paint of the surface, the backdrop, the way from closed to shown (the class `showing`) and the parts. It takes no host, a dialog with slots needs a shadow root. The component adds the place, the size, the border and the look before it is shown, on the selector `dialog` and in properties the module does not set. A surface that reaches an edge of the screen keeps what is in it clear of the notch and the home indicator: the component says the room of each side (`--_el-modal-inset-*`, from `env(safe-area-inset-*)`), the module makes it the padding of the surface, and it tells what is in the surface that nothing is left to keep clear of (`--_el-context-inset-*: 0px`).

Rules:

1. **Host as argument**: every module is a function of the host selector, `':host'` by default, or the tag for a component without a shadow root (`formControlStyle('el-input-field')`).
2. **Reflect the attribute**: the modules select the host by attribute, so the component declares `variant`, `appearance` and `size` with `reflect: true`.
3. **Internal properties**: what a module sets on the host starts with `--_el-`. These are not tokens; themes set `--el-*` only.
4. **Component styles are in no cascade layer**: element-js adopts the stylesheets of the page into every shadow root, where a component in a layer would lose against any rule of the page that is in none.
5. **A container tells its controls in inherited properties, and never writes to them.** A control reads the context in its own stylesheet, on the element it paints, and falls back to its own value (`var(--_el-context-size-height, var(--_el-size-height))`): the look is the same before and after the script. It reads the context only while the page has given it no value of its own. A stylesheet cannot ask that, because element-js writes the defaults onto the element: the control remembers which attributes were there when it connected, before `super.connectedCallback()`, and marks the element it paints from its template (`button--inherit-size` of `el-button`). On the server no default has been written, so `hasAttribute()` is the answer there.
6. **A region of `el-app-frame` tells the components in it how far its surface reaches** past its content, on each side (`--_el-context-inset-block-start`, `-block-end`, `-inline-start`, `-inline-end`: the room of the notch and the home indicator), and that it draws the line to the content itself (`--_el-context-line-block-end` in the header, `-block-start` in the footer). A component that is the surface of a region (`el-app-bar`, `el-nav`, `el-status-bar`) pulls its surface into that room with negative margins and pads its content by it, on an element inside of its shadow root: a reset of the page (`margin: 0` for everything) wins over a rule for the host. Only the header, the footer and the navigation have that room. The content and the aside say nothing, so a bar in a card there is not pulled out of it.

### Stylesheets for the Page

Beside the modules, `src/styles/` has the stylesheets a page imports (`./styles/*.css` in the exports map):

- **`native.css`**: the look of the native controls of the fields from the tokens (`el-input-field input`, `el-password-field input`, `el-otp-field input`, `el-combobox-field input`, `el-date-field input`, `el-tag-field input`, `el-file-field input`, `el-textarea-field textarea`, `el-select-field select`). In no cascade layer, and only for controls inside a field. The file input of `el-file-field` has one rule more, for its button (`::file-selector-button`), and the control of `el-date-field` one that takes the padding off the parts of a date, so it is as high as an input for text. A text field with content in its control has a row around its input (`.control`, see the `input-control` module): the file gives that row the border, the surface, the focus ring (`:has(input:focus)`), the border of a field that is not valid and the look of a disabled one, and takes them off the input inside. The rules for that input name the row, so they win over the rules for an input whichever comes first. The colour input of `el-color-field` and the range of `el-range-field` have rules of their own there: a colour input is a well with the border and the height of an input, a range has no border to decorate and gets the width of the field and the accent colour. A control that is disabled fades (`opacity: 0.55`, the value of a disabled `el-button`) and has the cursor `not-allowed`: the colours of the file take away what the browser does for the state. A range is drawn in grey by the browser and gets the cursor alone.
- **`utilities.css`** (layer `el-utilities`): utility classes, `el-visually-hidden` so far.
- **`layers.css`**: `@layer el-tokens, el-utilities;` and nothing else. Every stylesheet that uses a layer starts with the same statement.

Rules:

1. **A theme sets tokens** (layer `el-tokens`) and does not decorate controls. A rule that every theme would have to copy belongs in `native.css` or in the component. A theme may bring what no token can carry (`sketchy.css`: a `@font-face`, a shadow for the accordion, a gap between the tabs).
2. **A field that renders a native input, textarea or select** is decorated by `native.css`, not by its own stylesheet: without that file the control keeps the look of the browser. Add the tag of the field to each of its rules there.
3. **`native.css` stays out of a layer.** A layer loses against every rule of the page that is in none, a reset included; the Storybook has such a reset (Tailwind 3 from a CDN). The open question is issue #106.
4. **`native.css` and the stylesheet of a field have rules of the same weight.** Never let the order decide between them: state the same value in both (the touch target), or let `native.css` set an internal property that the field reads (`--_el-select-indicator-display`).
5. **Check a change to the cascade in a page that has a reset.** The tests have none. Look at a themed field in the Storybook, and measure both orders: the stylesheets before the styles of the fields (`<style>` in `head`) and after them (`document.adoptedStyleSheets`).
6. **Tests** for these files are next to them (`native.test.feature.js`, `utilities.test.feature.js`) and load the CSS with `?raw` into a `<style>`.

### Code Style

- **Linting**: Oxlint (the `lint` block in `vite.config.ts`)
- **Formatting**: Oxfmt (the `fmt` block in `vite.config.ts`), run on staged files by lint-staged
- **Pre-commit hooks**: Husky runs linting and formatting on commit
- **Indentation**: Use project's configured settings (check `.editorconfig`)

### Testing

- **Test runner**: Vitest 5 (bundled with Vite+) with browser mode (using Playwright + Chromium)
- **Imports**: test files import from `vite-plus/test`, not `vitest` (the `vite-plus/prefer-vite-plus-imports` lint rule enforces it)
- **Test helpers**: Custom utilities in `test-helpers.js` (fixture, assert, nextFrame, etc.)
- **Test types**:
    - Unit tests (`.test.unit.js`): Test component logic in isolation
    - Feature tests (`.test.feature.js`): Test component behavior and integration
- **Run tests**: `npm test` (runs all tests once)
- **Watch mode**: `npm run test:watch` (interactive watch mode)
- **Coverage**: `npm run test:coverage` (generates coverage reports)
- **UI mode**: `npm run test:ui` (visual test runner interface)
- **Configuration**: `vitest.config.js`, `vitest.setup.js`, and `test-helpers.js`

### Storybook

- **Development**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build-storybook` (outputs to `storybook-static/`)
- **Stories location**: Each component has a `.stories.js` file
- **Addons**: `@storybook/addon-links`, `@storybook/addon-docs`, `@chromatic-com/storybook`, `@storybook/addon-a11y`

## Common Tasks

### Running the Development Environment

```bash
npm run dev
```

This starts Storybook on http://localhost:3000

### Linting

```bash
npm run lint          # Lint JavaScript (Oxlint)
npx vp fmt            # Format everything (Oxfmt)
npx vp check          # Format check + lint in one go
```

### Testing

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in interactive watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui       # Run tests with visual UI
```

Note: Tests run in a real browser (Chromium via Playwright) using Vitest's browser mode.

## Important Notes for AI Assistants

### When Working from an Issue

1. **Need, not solution**: an issue states a need and the requester's context (often a downstream app). Its acceptance criteria are binding; a proposed solution is not.
2. **Fit this library**: build what matches this library's conventions and API, even where that differs from the proposal, and explain every deviation in the PR under "Deviations from the issue".
3. **Wrong place**: if the need does not belong in this library, say so in the issue instead of building it.
4. **Nothing for one framework**: the library ships no typings, wrappers or subpaths for a framework. What a framework needs is generated in the project that uses it, from `custom-elements.json`. The part of this library is a manifest that is complete and right.

### When Adding Features

1. **Follow existing patterns**: Look at similar components for reference
2. **Test coverage**: Always add both unit and feature tests
3. **Accessibility**: Consider ARIA attributes and keyboard navigation
4. **Documentation**: Add or update Storybook stories
5. **Styling**: Keep styles scoped to components using the `.style.js` pattern

### When a Field Wraps a Native Control

1. **Write an attribute of the control only when it changes.** A plain binding (`min="${value}"`) does that, and leaves the attribute out for `null`, on the server as well. `spreadAttributes()` and `optionalAttribute()` write with every render. For most attributes that makes no difference; a control for a date drops what the user has entered of a date so far when its `value`, `min`, `max` or `step` is written again, with the same text as well.
2. **Keep "no value" as it is while the control is empty.** A value that goes from `null` to `''` is written to the control as its default. `FormField.onChange()` keeps the `null`; a field with an `onChange()` of its own has to do the same.
3. **Test with real keys, and with a render between two of them.** A test that sets `control.value` and fires `input` does not see what the control does with a half-entered value.

### When an Element Is Form-Associated

`el-button` is (`static formAssociated = true`): the platform resolves its `form` attribute and tells it when a `<fieldset disabled>` disables it (`formDisabledCallback()`).

1. **Any `disabled` attribute disables the element for the platform**, `disabled="false"` included: `:disabled` matches, and the browser keeps every click from the element. element-js writes `disabled="false"` for a property that came from an attribute. So the element reflects `disabled` itself, as an attribute that is there or gone (`reflectProperty()` in `button.js`), and takes a `disabled="false"` of the page off (`attributeChangedCallback()`).
2. **The element is no submit button for the platform.** `form.requestSubmit(element)` throws, and Enter in a field does not find it. A form is submitted with a native submit button that belongs to it: `el-button` has a hidden one in its content (`_syncSubmitter()`). It makes that button when the form is first submitted with it, by a click or by Enter in a field (`_onRootKeydown()`), and not when it starts: a framework that hydrates a server-rendered page expects the children it rendered, and the element can have started before it (issue #184, and #96 for the carousel).
3. **A child of the element is on the event path of the control it is slotted into.** A click on that hidden button passes the `<button>` in the shadow root, and its listener.
4. **The listener of the control is the first to have a click**, before every listener of the page. A native control acts once all of them have had the event, and not when one has called `preventDefault()`. So what a click does to the form waits for the end of its path (`_afterListeners()` in `button.js`), and for a task when a listener stops the event before it gets there.
5. **None of this is there before the script has run.** Only a native control in the page belongs to a form then (issue #86).

### When an Element Has a Custom State

1. **Write a state, and never read it back.** `this._internals.states.add()` and `.delete()` work in every browser. In WebKit `states.has()` is `false` and the set is empty a moment after `add()`, while `:state()` still matches (measured on iOS 27: within a second). A component that has to know keeps a field of its own, as `_keyboard` in `app-frame.js`.
2. **A test in Chromium does not see this.** It says what WebKit does in its place: `el._internals.states.has = () => false`.

### When an Element Lays Out What the Page Slots Into It

1. **Take nothing from the margin, the padding or the border of a slotted element.** A rule of the page wins over a `::slotted()` rule of a shadow root, whatever its specificity and its cascade layer, and a reset has such a rule for every element: `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; }` in Tailwind CSS v4. A gap or a line that hangs on those properties is gone on such a page. `margin: 0` for what is slotted is no such rule: it is what the reset says as well.
2. **Give the room to a part in the shadow root.** A gap that is there only with something slotted is the `column-gap` of the part around the slot, which ends or begins with an empty box of its own (`::after` or `::before` with `content: ''`): a gap is between two boxes, so a part with nothing slotted has none (`list-item.style.js`).
3. **Offer a custom property for that room** (`--el-list-gap`), and name it in the readme: the page cannot take the room away with a margin of its own any more, which adds to it.
4. **Test it with `withAndWithoutPageReset()`** (`src/test-helpers.js`). It measures the same fixture twice, on the page as it is and on the page with that reset, and the test compares the two. Slot elements with a size of their own into the fixture: the reset changes a `<button>` of the page itself.

### When Modifying Components

1. **Check dependents**: Components may be used by other components
2. **Update tests**: Ensure tests reflect changes
3. **Update stories**: Keep Storybook documentation in sync
4. **Maintain API**: Breaking changes should be flagged (pre-1.0 project)

### When Debugging

1. **Storybook**: Use for visual debugging and interaction testing
2. **Test runner**: Use watch mode for rapid iteration
3. **Browser DevTools**: Components are native web components
4. **Coverage reports**: Check test coverage to identify gaps

### Code Quality Expectations

- All code should pass Oxlint (`npm run lint`)
- Oxfmt formatting is enforced via pre-commit hooks
- Tests should be written for new features
- Accessibility should be considered for all UI components
- Component APIs should be simple and intuitive

## Git Workflow

- **Main branch**: `main`
- **Pre-commit hooks**: Automatically lint and format staged files
- **Commit messages**: Use clear, descriptive messages
- **Feature branches**: Use descriptive branch names

## Releasing & Publishing

Releases are fully automated by `.github/workflows/npm-publish.yml`, which is triggered by pushing a `v*` git tag. The workflow has three sequential jobs:

1. **test** — `npm ci`, install Chromium, `npm test`, then `npm run test:catalog` (the Node SSR catalog smoke test); the publish gate — a red test blocks the release.
2. **publish** — publishes to npm via **OIDC trusted publishing** (no token). Requires `id-token: write` permission, npm `>= 11.5.1` (the workflow upgrades npm), and a Trusted Publisher configured on npmjs.com for this repo + `npm-publish.yml`. `prepack` regenerates `custom-elements.json`, `web-types.json`, `types/**`, and `catalog.js` before packing.
3. **github-release** — creates a GitHub Release for the tag, using the matching `## [x.y.z]` section of `CHANGELOG.md` as the body (falls back to auto-generated commit notes if no section is found).

### Cutting a release

1. Move the accumulated `## Unreleased` notes — in the root `CHANGELOG.md` **and** every touched component's `*.changelog.md` — into a new `## [x.y.z] - YYYY-MM-DD` heading, leaving a fresh empty `## Unreleased` above. Components with no changes that release keep only their existing entries.
2. Bump the version and create the tag:
    ```bash
    npm version patch   # or minor / major — bumps package.json and creates the vX.Y.Z tag
    git push --follow-tags
    ```
3. The tag push runs the workflow: test → npm publish (OIDC) → GitHub Release.

### Notes

- **No npm token exists** — publishing is tokenless via OIDC. Do not reintroduce an `NPM_TOKEN` secret or a 2FA-bypass token.
- **GitHub Releases** live at `https://github.com/webtides/element-library/releases` and are created automatically by the workflow. To backfill or create one manually for an existing tag: `gh release create vX.Y.Z --notes-file <file>` (or `--generate-notes`).
- The npm tarball contents are controlled by the `files` array in `package.json`; verify with `npm pack --dry-run` before tagging.

## Resources

- **Live Storybook**: https://webtides.github.io/element-library
- **Contributing Guide**: `.github/CONTRIBUTING.md`
- **License**: MIT (see LICENSE file)

---

_This file is meant to provide context to AI assistants. It should be updated as the project evolves._

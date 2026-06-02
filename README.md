# element-library

> IMPORTANT: The elements are work in progress and subject to major (& breaking) changes until the 1.0 release. Until then, we would encourage everyone to use pinned versions and not rely on semantic versioning.

A set of web components built with `@webtides/element-js`

## Introduction

`@webtides/element-library` provides a set of pre-built custom elements based on `@webtides/element-js` with performance and accessibility in mind. They provide a starting point for rapidly building UIs without having to re-implement the same elements over and over again.

## Demo

See our [live Storybook](https://webtides.github.io/element-library) to preview examples of all our elements.

## Installation

```sh
npm i --save @webtides/element-library
```

## Usage

Register all components at once:

```js
import '@webtides/element-library/all';
```

Register a single component (tree-shakable):

```js
import '@webtides/element-library/accordion/define';
```

Import a component class without registering it:

```js
import { Accordion } from '@webtides/element-library/accordion';
```

## Theming

Components are **headless by default** — no theme imported means no opinionated colors, borders, or shadows. To opt in to a coherent look, import one of the shipped themes:

```js
import '@webtides/element-library/themes/default.css'; // neutral, system-feeling
import '@webtides/element-library/themes/high-contrast.css'; // WCAG-AAA-leaning
```

Each theme defines the library's `--el-*` design-token contract at `:root` and uses `light-dark()`, so a single import covers both light and dark color schemes. You can override individual tokens to customize, or ship a full custom theme using the same pattern — see the [Theming guide](https://webtides.github.io/element-library/?path=/docs/docs-theming--docs) in the live Storybook for the token reference, custom states, and CSS Parts.

## Components

| Package            | Description                                                                   | Version |
| ------------------ | ----------------------------------------------------------------------------- | ------- |
| accordion          | Single Accordion element                                                      | `0.1.0` |
| accordion-group    | Accordion group to hold multiple elements                                     | `0.1.0` |
| amount-field       | A simple element to create amount stepping input fields                       | `0.1.1` |
| button             | A themeable button with variants, sizes, icon slots, caret and loading        | `0.1.0` |
| carousel           | A carousel element that wraps the glide.js library for sliding elements       | `0.1.1` |
| checkbox-field     |                                                                               | `0.1.1` |
| dialog             | A modal dialog built on the native `<dialog>` element                         | `0.1.0` |
| dropdown           | A dropdown element                                                            | `0.1.0` |
| form-field         |                                                                               | `0.1.0` |
| input-field        |                                                                               | `0.1.0` |
| lazy-src           |                                                                               | `0.2.0` |
| password-field     | A masked password input with an optional show/hide reveal toggle              | `0.1.0` |
| radio-field        | A single-choice radio group built on a native fieldset                        | `0.1.0` |
| scroll-to          |                                                                               | `0.1.0` |
| scroll-to-top      |                                                                               | `0.1.0` |
| select-field       |                                                                               | `0.1.0` |
| slider             | CSS only slider element to slide child elements                               | `0.4.3` |
| sticky             |                                                                               | `0.2.0` |
| svg-use            |                                                                               | `0.1.0` |
| switch-field       | An on/off toggle backed by a native checkbox with role="switch"               | `0.1.0` |
| tab-group          | A tab group wraps a list of tab-links and tab-panels and shows one at a time  | `0.1.0` |
| tab-link           | A link that serves as a label for one of the tab panels to display that panel | `0.1.0` |
| tab-panel          | The element that contains the content associated with a tab                   | `0.1.0` |
| textarea-field     |                                                                               | `0.1.0` |
| transition-classes | An element that applies classes for various stages of a transition            | `0.1.0` |

<!-- Please move these up once they are implemented
| modal-element        |                                                 | TBD  |
| bottom-sheet         |                                                 | TBD  |
| side-sheet           |                                                 | TBD  |
| notification-element | Toast, Alert ?!                                 | TBD  |
| breadcrumb-element   |                                                 | TBD  |
| horizontal-scroll    |                                                 | TBD  |
| load-more            | show/load more                                  | TBD  |
| show-hide            |                                                 | TBD  |
| progress-bar         |                                                 | TBD  |
| star-rating          |                                                 | TBD  |
| navigation-drawer ?! |                                                 | TBD  |
| hover-indicator      |                                                 | TBD  |
| pinch-zoom           |                                                 | TBD  |
| cookie-consent       |                                                 | TBD  |
| rich-text            |                                                 | TBD  |
| code-block           |                                                 | TBD  |
| spread-sheet         |                                                 | TBD  |
| line-through       |               | TBD |
| divider-element ?! |               | TBD |
| scroll-entrance    |               | TBD |
| chip-element       | Tag, Label ?! | TBD |
| read-time ?!       |               | TBD |
| code-tabs          |               | TBD |
| empty-state ?!     |               | TBD |
| compare-images     |               | TBD |
| text-highlight     |               | TBD |
| tooltip-element    | Popover ?!    | TBD |
| dropdown-field     |             | TBD  |
| range-field        |             | TBD  |
| input-group        |             | TBD  |
| tag-field          | multiple    | TBD  |
| autocomplete-field |             | TBD  |
| date-picker        |             | TBD  |
| multi-range-field  |             | TBD  |
-->

## Contributing & Development

For contributions and development see [contributing docs](.github/CONTRIBUTING.md)

## License

`@webtides/element-library` is open-sourced software licensed under the MIT [license](LICENSE).

# element-library

A set of web components built with `@webtides/element-js`

## Introduction

`@webtides/element-library` provides a set of pre-built custom elements based on `@webtides/element-js` with performance and accessibility in mind. They provide a starting point for rapidly building UIs without having to re-implement the same elements over and over again.

## Documentation

For detailed documentation see the [Docs](docs/README.md).

## Elements

Elements are divided into 3 categories.

### Interactions

| Package              | Description     | Version | Type |
| -------------------- | --------------- | ------- | ---- |
| accordion-element    |                 | TBD     | free |
| modal-element        |                 | TBD     | free |
| bottom-sheet         |                 | TBD     | pro  |
| side-sheet           |                 | TBD     | pro  |
| dialog-element       |                 | TBD     | free |
| notification-element | Toast, Alert ?! | TBD     | free |
| tabs-element         |                 | TBD     | free |
| breadcrumb-element   |                 | TBD     | free |
| horizontal-scroll    |                 | TBD     | free |
| load-more            | show/load more  | TBD     | free |
| show-hide            |                 | TBD     | free |
| progress-bar         |                 | TBD v2  | free |
| star-rating          |                 | TBD v2  | free |
| navigation-drawer ?! |                 | TBD v2  | free |
| hover-indicator      |                 | TBD v2  | pro  |
| pinch-zoom           |                 | TBD v2  | pro  |
| slider-element       |                 | TBD v2  | pro  |
| cookie-consent       |                 | TBD     | pro  |
| rich-text            |                 | TBD v2  | pro  |
| code-block           |                 | TBD v2  | pro  |
| spread-sheet         |                 | TBD v2  | pro  |

### Elements

| Package            | Description   | Version | Type |
| ------------------ | ------------- | ------- | ---- |
| lazy-src           |               | `0.1.0` | free |
| scroll-to          |               | `0.1.0` | free |
| scroll-to-top      |               | `0.1.0` | free |
| svg-icon           |               | TBD     | free |
| line-through       |               | TBD v2  | free |
| divider-element ?! |               | TBD v2  | free |
| scroll-entrance    |               | TBD v2  | free |
| sticky-element     |               | TBD     | free |
| chip-element       | Tag, Label ?! | TBD     | free |
| read-time ?!       |               | TBD v2  | free |
| code-tabs          |               | TBD v2  | free |
| empty-state ?!     |               | TBD v2  | free |
| compare-images     |               | TBD v2  | pro  |
| text-highlight     |               | TBD v2  | pro  |
| tooltip-element    | Popover ?!    | TBD     | pro  |

### Form Fields

| Package            | Description | Version | Type |
| ------------------ | ----------- | ------- | ---- |
| checkbox-field     |             | `0.1.0`     | free |
| form-field        |             | `0.1.0`     | free |
| input-field        |             | `0.1.0`     | free |
| textarea-field        |             | `0.1.0`     | free |
| password-field     |             | TBD     | free |
| radio-field        |             | TBD     | free |
| switch-field       |             | TBD     | free |
| dropdown-field     |             | TBD     | free |
| range-field        |             | TBD     | free |
| input-group        |             | TBD     | free |
| tag-field          | multiple    | TBD     | pro  |
| autocomplete-field |             | TBD     | pro  |
| date-picker        |             | TBD v2  | pro  |
| multi-range-field  |             | TBD v2  | pro  |

## Versioning

We use `lerna` to version and publish new releases for packages automatically when pushing changes to the `master` branch. To trigger a new release simply change the version in a package.json of an element or a package. The CI will pick it up and publish it.

## License

`@webtides/element-library` is open-sourced software licensed under the MIT [license](LICENSE).

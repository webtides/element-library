# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Added

- Keyboard support: the arrow keys move to the next and the previous link and select it, Home and End go to the first and the last one. Disabled links are skipped, and the arrow keys wrap around. Before, a tab could only be changed with a click. ([#97](https://github.com/webtides/element-library/issues/97))
- `orientation` (`'horizontal'` by default, or `'vertical'`): which arrow keys move between the links, left and right or up and down. ([#97](https://github.com/webtides/element-library/issues/97))
- The group tells assistive technology what its parts are: the selected link has `aria-selected="true"` and is the only link in the tab order (roving `tabindex`), every panel is labelled by its link (`aria-labelledby`; a link without an `id` gets one), and the element around the links gets `role="tablist"` and `aria-orientation`, unless the page gave it another role. ([#97](https://github.com/webtides/element-library/issues/97))

### Changed

- Put the links into an element of their own (for example a `<div>`), so that the group can make it the `tablist`. Links that are direct children of the group still work, with the keyboard too, but have no `tablist` around them, which axe reports (`aria-required-parent`). The group cannot be the list itself, because it holds the panels as well. ([#97](https://github.com/webtides/element-library/issues/97))

## [0.1.0] - 2026-06-03

### Changed

- Selection is now mirrored onto child `<el-tab-link>` elements via the `active` custom state instead of the `[active]` attribute. The `selected` attribute on `<el-tab-group>` itself is unchanged.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.1] - 2021-07-21

### Changed

update element-js version

## [0.1.0] - 2020-11-10

### Added

- initial release

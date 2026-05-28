# Change Log

All notable changes to `@webtides/element-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/). Per-component changelogs live next to each component (`src/components/<name>/<name>.changelog.md`); this file is the aggregated, package-level view.

<!--
   PRs should add an entry to the Unreleased section below, grouped by component.
   Mirror the same entry in the component's own changelog. Uncomment subsection
   headings as needed.
-->

## Unreleased

### Theming

- Added: opt-in default theme stylesheet at `@webtides/element-library/themes/default.css`. Defines the `--el-*` token vocabulary at `:root` with `light-dark()` color values; without it imported, components stay headless.
- Added: Storybook toolbar gains a "Theme" switch (None / Default) and a "Color scheme" switch (System / Light / Dark) for previewing themed and unthemed states.

### accordion-element

- Added: `open` custom state on the host (`:host(:state(open))`).
- Changed (BREAKING): renamed CSS parts `title-wrapper` → `title` and `content-wrapper` → `content`; the internal `.content-wrapper` class is now `.content`.
- Changed: internal style now uses `:host(:state(open))` instead of `:host([open='true'])`. The reflected `open` attribute is unchanged.
- Changed: expand/collapse transition is token-driven (`--el-duration-md`, `--el-ease`).

### checkbox-field

- Added: `checked` custom state on the host. Inherits the `touched / valid / invalid` states from `FormField`.

### dropdown-element

- Added: `open` custom state on the host.

### form-field

- Added: host-level `touched`, `valid` and `invalid` custom states. Inherited by all field subclasses. The inner `.field.is-*` classes still exist for internal use.

### input-field

- Changed: hardcoded values now reference design tokens (`--el-space-*`, `--el-color-success`, `--el-color-danger`, `--el-font-size-sm`) with the previous values as fallbacks.

### lazy-src

- Added: `loaded` custom state on the host (alongside the existing reflected `loaded` attribute).

### select-field

- Changed (BREAKING): renamed the dropdown indicator's CSS class from `.icon` to `.dropdown-indicator`.

### slider-element

- Changed: hardcoded colors and paddings now reference design tokens (`--el-color-fg`, `--el-color-bg`, `--el-space-*`). Color fallbacks use `light-dark()` so unthemed dark mode renders sensibly.

### sticky-element

- Changed (BREAKING): replaced the `.is-sticky / .is-up / .is-down` host classes with the custom states `:state(sticky) / :state(up) / :state(down)`.
- Changed: sticky transition is token-driven (`--el-duration-md`, `--el-ease`).

### tab-group

- Changed: selection is mirrored onto child `<el-tab-link>` elements via the `active` custom state instead of the `[active]` attribute.

### tab-link

- Changed (BREAKING): the active state is now exposed as `:state(active)` instead of `[active]`.

## [0.1.0] - TBD

Initial public release on npm under the consolidated single-package layout.

Pre-merge per-component release history is preserved in each component's `*.changelog.md` under the "Legacy (pre-merge)" heading.

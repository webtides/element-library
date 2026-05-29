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
- Added: opt-in high-contrast theme stylesheet at `@webtides/element-library/themes/high-contrast.css`. Same token contract, accessibility-leaning identity: near-black/white surfaces, 2px borders, 3px focus rings, no shadows, larger touch targets. Supports both color schemes via `light-dark()`.
- Added: Storybook toolbar gains a "Theme" switch (None / Default / High contrast) and a "Color scheme" switch (System / Light / Dark) for previewing themed and unthemed states.
- Added: Theming docs page in Storybook (`Docs / Theming`) covering the headless philosophy, themes vs color schemes, the full `--el-*` token reference, and a recipe for writing custom themes. README gains a short Theming section pointing at it.
- Added: both shipped themes respect `prefers-reduced-motion: reduce` (collapses `--el-duration-md` to `0s`). Default theme also responds to `prefers-contrast: more` (bumps fg/border to pure black/white, raises border-width to 2px and focus-ring-width to 3px). High-contrast theme is already at its contrast ceiling.
- Added: both shipped themes suppress the native `<select>` chevron and position `el-select-field`'s `.dropdown-indicator` over the right edge, so themed selects show a single, theme-colored glyph instead of duplicating the native one. Unthemed selects still render the native chevron with the custom indicator hidden — no double chevron either way.
- Added: Storybook preview decorator mirrors the active theme's `--el-color-bg` / `--el-color-fg` onto the iframe `<body>`, so flipping Theme or Color scheme also flips the page background. Stays inside Storybook; doesn't leak into consumer themes.
- Changed: `el-dropdown-element` panel now reads `--el-shadow-lg` and `--el-radius-lg` (previously `-md`). Floating surfaces conventionally use more pronounced elevation. Themes that already set both tokens get the upgrade automatically.
- Changed: expanded token-driven surfaces across components so the theme toggle is actually visible — dropdown panel, accordion title/content padding + divider, checkbox indicator + accent, tab-link active accent + hover, tab-group bottom border, form-field label margin/color, amount-field wrapper border + button/input padding. All fallbacks are null-ish (`0` widths, `transparent` colors, `none` shadows) so unthemed components remain headless.
- Changed: default theme decorates native form controls (`input`, `textarea`, `select`) directly via component selectors, since those live in light DOM and can't be safely overridden from component CSS without losing the native unthemed look.
- Changed: slider-element fallbacks for dot color and arrow background are now `currentColor` / `transparent` instead of `#333` / `white` — unthemed slider matches surrounding text instead of imposing a light-mode-assuming palette.

### accordion-element

- Added: `open` custom state on the host (`:host(:state(open))`).
- Changed (BREAKING): renamed CSS parts `title-wrapper` → `title` and `content-wrapper` → `content`; the internal `.content-wrapper` class is now `.content`.
- Changed: internal style now uses `:host(:state(open))` instead of `:host([open='true'])`. The reflected `open` attribute is unchanged.
- Changed: expand/collapse transition is token-driven (`--el-duration-md`, `--el-ease`).
- Fixed: collapsed content no longer leaves a padding-sized sliver — the `.content` padding moved to an inner `.content-inner` wrapper so closing the accordion clips it. Only surfaced once a theme set `--el-space-3`.

### carousel-element

- Fixed: `ShadowHtml` now forwards Glide's `Events` argument to the wrapped html component (like the other `Shadow*` wrappers). It previously called the factory with `(Glide, Components)` only, so `Events.on('update', …)` threw `Cannot read properties of undefined (reading 'on')` on every mount.
- Fixed: Glide's core + theme CSS is inlined into the component style instead of `@import`-ed. The `@import` was dropped inside the shadow-DOM adopted stylesheet, so arrows/bullets weren't positioned over the slides (they appeared as a strip below the image) and the track wasn't clipped.

### checkbox-field

- Added: `checked` custom state on the host. Inherits the `touched / valid / invalid` states from `FormField`.
- Fixed: the native `<input type="checkbox">` is now visually hidden (still focusable / in the a11y tree) instead of rendering a second box next to the custom indicator; the duplicated label is gone (the base `FormField` label is suppressed in favour of the inline one). `.checked-indicator` gained `currentColor` fallbacks so unthemed checkboxes stay visible, plus `:focus-visible` styling.

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

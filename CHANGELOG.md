# Change Log

All notable changes to `@webtides/element-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/). Per-component changelogs live next to each component (`src/components/<name>/<name>.changelog.md`); this file is the aggregated, package-level view.

<!--
   PRs should add an entry to the Unreleased section below, grouped by component.
   Mirror the same entry in the component's own changelog. Uncomment subsection
   headings as needed.
-->

## Unreleased

## [0.1.0] - 2026-06-03

### Components

- Added: new `el-button` component — a themeable button modelled on Shoelace's `<sl-button>` (variants, sizes, outline/pill/circle, caret, loading, prefix/suffix slots, link mode).
- Added: new `el-dialog` component — a modal dialog built on the native `<dialog>` element (platform-provided focus trap, background `inert`, focus restore and `<form method="dialog">` auto-close), with an animated, cancelable open/close lifecycle and ref-counted body-scroll locking that compensates for the removed scrollbar width (no layout shift on open). API modelled on Shoelace's `<sl-dialog>`.
- Added: new `el-notification` component — an alert/notification that can be shown inline or as a transient toast (`toast()` floats it into a shared top-right stack). Semantic variants, optional close button, optional auto-dismiss that pauses on hover/focus, and an ARIA live-region host (`role="alert"` for danger/warning, `role="status"` otherwise). API modelled on Shoelace's `<sl-alert>`.
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

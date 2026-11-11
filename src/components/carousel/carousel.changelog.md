# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Changed

- On a touch screen (`@media (any-pointer: coarse)`) the arrows are at least `--el-touch-target` wide and high (28 × 22 px before). The bullets keep their size of 13 px: each gets a hit area of `--el-touch-target` around its dot, and the bullets move apart by as much, so that the areas do not overlap. The row of bullets wraps when it gets wider than the carousel. Unchanged on a fine pointer and without the token.
- The copies of the slides that Glide needs for looping are kept in the shadow root. The children of the element stay what the page wrote: before, four slides became eight children as soon as the carousel started, and a framework that hydrated a server-rendered carousel with slides from a loop found nodes it had not rendered (Svelte 5: `hydration_mismatch`, the page was built again). A rule of the page's style sheets still styles a copy when it selects the slide by a class; a selector that needs an ancestor outside the carousel (`el-carousel > div`, `.gallery .slide`) no longer reaches the copies. See "Looping, and server-rendered slides" in the readme. ([#96](https://github.com/webtides/element-library/issues/96))

### Fixed

- The arrow buttons have an accessible name when their slots are empty: "Previous slide" and "Next slide", for screen readers only. What is put into the `arrow-left` and `arrow-right` slots replaces that name, as it named the button before. An arrow with an empty slot was a button without a name (axe `button-name`). ([#94](https://github.com/webtides/element-library/issues/94))
- Going on from the last slide shows the first slide coming in. It showed a copy of the second one, which then jumped to the first: the copies after the last slide were in the wrong order. ([#96](https://github.com/webtides/element-library/issues/96))
- `api.update()` keeps the slides. After an update Glide took the `<slot>` for its only slide, so the carousel had one empty slide. ([#96](https://github.com/webtides/element-library/issues/96))
- What a page puts into the `arrow-left` or `arrow-right` slot no longer gets the margins of a slide gap. ([#96](https://github.com/webtides/element-library/issues/96))

## [0.1.1] - 2026-06-04

### Fixed

- The carousel now bundles in consumer projects. `ShadowHtml` deep-imported `@glidejs/glide/src/components/html`, whose pristine source does `import { exist, toArray } from '../utils/dom'` even though `dom.js` exports no `exist` — `esbuild`/Vite reject this as a hard error ("No matching export for import 'exist'"). `0.1.0` patched it via `patch-package`/`postinstall`, but a dependency's `postinstall` runs from its own nested directory and cannot reach the consumer's hoisted `@glidejs/glide`, so the patch never applied downstream (and the missing `patch-package` binary broke `npm install` outright). The fixed Glide `html.js` is now vendored as `glide/components/glide-html.js` (upstream verbatim minus the unused `exist` import) and `ShadowHtml` imports that copy, removing all reliance on patching consumers' `node_modules`.

## [0.1.0] - 2026-06-03

### Changed

- BREAKING: renamed the component — tag `el-carousel-element` → `el-carousel`, import subpaths `@webtides/element-library/carousel-element` → `/carousel` (and `/carousel-element/define` → `/carousel/define`), and exported class `CarouselElement` → `Carousel`.

### Fixed

- The shadow-DOM `Html` component (`ShadowHtml`) now forwards Glide's `Events` argument to the wrapped `@glidejs/glide` html component, matching the sibling `ShadowAnchors` / `ShadowClones` / `ShadowGaps` wrappers. Previously it called the factory with only `(Glide, Components)`, so the underlying component's `Events.on('update', …)` threw `Cannot read properties of undefined (reading 'on')` on every mount.
- Glide's core + theme CSS is now inlined in `carousel.style.js` instead of being pulled in with `@import '@glidejs/glide/dist/css/…'`. The `@import` was silently dropped because element-js applies component styles as constructed/adopted stylesheets, where `@import` is not allowed — so `.glide__track` lost `overflow: hidden` and the arrows/bullets lost their absolute positioning and fell into a strip below the slides instead of overlaying them.

## Legacy (pre-merge)

The version numbers below predate the single-package merge and refer to the component's former standalone npm package, not the current `@webtides/element-library` version. Kept for historical reference.

## [0.1.4] - 2021-07-21

### Changed

update element-js version

## [0.1.3] - 2020-10-09

### FIXED

- fix glide dependecy

## [0.1.2] - 2020-10-09

### Added

- part marker to glide template for better themability

## [0.1.1] - 2020-09-28

### Fixed

- disabled state

## [0.1.0] - 2020-09-17

### Added

- initial release

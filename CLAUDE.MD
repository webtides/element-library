# CLAUDE.MD

This document provides context for AI assistants working with the `@webtides/element-library` codebase.

## Project Overview

`@webtides/element-library` is a collection of web components built with `@webtides/element-js`. The library provides pre-built custom elements with a focus on performance and accessibility.

- **Repository**: https://github.com/webtides/element-library
- **License**: MIT
- **Version**: 0.1.0
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
    - `@floating-ui/dom` for the place of the popover's panel

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
- **badge**: Label for a status or a count
- **button**: Themeable button
- **carousel**: Carousel wrapper for glide.js
- **checkbox-field**: Checkbox input
- **dropdown**: Dropdown component
- **form-field**: Base form field
- **input-field**: Text input field
- **lazy-src**: Lazy loading wrapper
- **scroll-to**: Scroll to target element
- **popover**: Panel that floats next to an anchor (native popover, placed with Floating UI)
- **scroll-to-top**: Scroll to top button
- **select-field**: Select dropdown
- **slider**: CSS-only slider
- **spinner**: Spinner for a wait of unknown length
- **sticky**: Sticky positioning element
- **svg-use**: SVG icon element
- **tab-group**: Tab container
- **tab-link**: Individual tab link
- **tab-panel**: Tab content panel
- **tag**: Label for a keyword or a filter, removable
- **textarea-field**: Textarea input
- **transition-classes**: CSS transition helper

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

`catalog.js` is **generated, not hand-edited** — regenerate it from the CEM with `npm run gen:catalog` whenever components are added or removed. Like `custom-elements.json`/`web-types.json`, it is **gitignored** (not committed) but shipped via the `files` allowlist, and the `prepack` hook regenerates it on every release so it can't drift from the components. The `test:catalog` script (a Node SSR smoke test, run in CI) renders a known tag through the renderer's `resolve` to verify the catalog actually resolves to component classes. It then compiles `test/catalog.types.ts`, which imports the export by package name under `strict`, to verify that a TypeScript consumer gets a typed default export.

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
- **`size`**: resolves the `size` attribute (`small` / `medium` / `large`) to internal properties.
- **`variants`**: resolves the `variant` attribute (`neutral` / `brand` / `success` / `warning` / `danger`) to the colours of five roles.
- **`appearance`**: paints those colours on a surface as `filled`, `outlined` or `plain`.
- **`form-control`**: the layout of a field around its control (label, help, `.field`, error).

Rules:

1. **Host as argument**: every module is a function of the host selector, `':host'` by default, or the tag for a component without a shadow root (`formControlStyle('el-input-field')`).
2. **Reflect the attribute**: the modules select the host by attribute, so the component declares `variant`, `appearance` and `size` with `reflect: true`.
3. **Internal properties**: what a module sets on the host starts with `--_el-`. These are not tokens; themes set `--el-*` only.
4. **Component styles are in no cascade layer**: element-js adopts the stylesheets of the page into every shadow root, where a component in a layer would lose against any rule of the page that is in none.

### Stylesheets for the Page

Beside the modules, `src/styles/` has the stylesheets a page imports (`./styles/*.css` in the exports map):

- **`native.css`**: the look of the native controls of the fields from the tokens (`el-input-field input`, `el-password-field input`, `el-textarea-field textarea`, `el-select-field select`). In no cascade layer, and only for controls inside a field.
- **`utilities.css`** (layer `el-utilities`): utility classes, `el-visually-hidden` so far.
- **`layers.css`**: `@layer el-tokens, el-utilities;` and nothing else. Every stylesheet that uses a layer starts with the same statement.

Rules:

1. **A theme sets tokens** (layer `el-tokens`) and does not decorate controls. A rule that every theme would have to copy belongs in `native.css` or in the component. A theme may bring what no token can carry (`sketchy.css`: a `@font-face`, `::part()` rules).
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

### When Adding Features

1. **Follow existing patterns**: Look at similar components for reference
2. **Test coverage**: Always add both unit and feature tests
3. **Accessibility**: Consider ARIA attributes and keyboard navigation
4. **Documentation**: Add or update Storybook stories
5. **Styling**: Keep styles scoped to components using the `.style.js` pattern

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

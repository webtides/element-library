# CLAUDE.MD

This document provides context for AI assistants working with the `@webtides/element-library` codebase.

## Project Overview

`@webtides/element-library` is a collection of web components built with `@webtides/element-js`. The library provides pre-built custom elements with a focus on performance and accessibility.

- **Repository**: https://github.com/webtides/element-library
- **License**: MIT
- **Version**: 0.1.0
- **Status**: Work in progress - subject to breaking changes until 1.0 release

## Technology Stack

- **Framework**: `@webtides/element-js` (^1.1.0)
- **Build Tool**: Vite (via Storybook)
- **Testing**: Vitest 4 (with browser mode), `@open-wc/testing`
- **Documentation**: Storybook 8.x
- **Linting**: ESLint, Stylelint, Prettier
- **External Dependencies**:
  - `@glidejs/glide` for carousel functionality
  - `lozad` for lazy loading

## Project Structure

```
element-library/
├── src/
│   └── components/        # All web components
│       └── [component-name]/
│           ├── [component-name].js         # Component logic
│           ├── [component-name].style.js   # Component styles
│           ├── [component-name].events.js  # Event constants (if needed)
│           ├── [component-name].stories.js # Storybook stories
│           ├── [component-name].test.unit.js    # Unit tests
│           └── [component-name].test.feature.js # Feature tests
├── .storybook/           # Storybook configuration
└── package.json
```

## Available Components

### Implemented Components

- **accordion-element**: Single accordion element
- **accordion-group**: Accordion group container
- **amount-field**: Amount stepping input field
- **carousel-element**: Carousel wrapper for glide.js
- **checkbox-field**: Checkbox input
- **dropdown-element**: Dropdown component
- **form-field**: Base form field
- **input-field**: Text input field
- **lazy-src**: Lazy loading wrapper
- **scroll-to**: Scroll to target element
- **scroll-to-top**: Scroll to top button
- **select-field**: Select dropdown (in progress)
- **slider-element**: CSS-only slider
- **sticky-element**: Sticky positioning element
- **svg-use**: SVG icon element
- **tab-group**: Tab container
- **tab-link**: Individual tab link
- **tab-panel**: Tab content panel
- **textarea-field**: Textarea input
- **transition-classes**: CSS transition helper

### Planned Components

See README.md for full list of components in planning/TBD status.

## Development Conventions

### Component Structure

All components follow this pattern:

1. **File naming**: Use kebab-case matching the component name
2. **Class naming**: Use PascalCase for the JavaScript class
3. **Custom element tag**: Use kebab-case for HTML tag names
4. **Each component has**:
   - Main `.js` file with component logic
   - `.style.js` file for CSS-in-JS styles
   - `.stories.js` file for Storybook documentation
   - `.test.unit.js` for unit tests
   - `.test.feature.js` for feature/integration tests
   - Optional `.events.js` for event constants

### Code Style

- **Linting**: Project uses ESLint for JS and Stylelint for CSS
- **Formatting**: Prettier is configured with lint-staged
- **Pre-commit hooks**: Husky runs linting and formatting on commit
- **Indentation**: Use project's configured settings (check .editorconfig if present)

### Testing

- **Test runner**: Vitest 4 with browser mode (using Playwright + Chromium)
- **Test framework**: Uses `@open-wc/testing` utilities
- **Test types**:
  - Unit tests (`.test.unit.js`): Test component logic in isolation
  - Feature tests (`.test.feature.js`): Test component behavior and integration
- **Run tests**: `npm test` (runs all tests once)
- **Watch mode**: `npm run test:watch` (interactive watch mode)
- **Coverage**: `npm run test:coverage` (generates coverage reports)
- **UI mode**: `npm run test:ui` (visual test runner interface)
- **Configuration**: `vitest.config.js` and `vitest.setup.js`

### Storybook

- **Development**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build-storybook`
- **Stories location**: Each component has a `.stories.js` file
- **Addons**: Accessibility, interactions, coverage, and essentials enabled

## Common Tasks

### Running the Development Environment

```bash
npm run dev
```

This starts Storybook on http://localhost:3000

### Linting

```bash
npm run lint          # Lint both JS and CSS
npm run lint:js       # Lint JavaScript only
npm run lint:css      # Lint CSS only
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

- All code should pass ESLint and Stylelint
- Prettier formatting is enforced via pre-commit hooks
- Tests should be written for new features
- Accessibility should be considered for all UI components
- Component APIs should be simple and intuitive

## Git Workflow

- **Main branch**: `master`
- **Pre-commit hooks**: Automatically lint and format staged files
- **Commit messages**: Use clear, descriptive messages
- **Feature branches**: Use descriptive branch names

## Resources

- **Live Storybook**: https://webtides.github.io/element-library
- **Contributing Guide**: `.github/CONTRIBUTING.md`
- **License**: MIT (see LICENSE file)

## Current Branch Context

This is a git worktree at `/Users/eddylowen/.claude-worktrees/element-library/intelligent-herschel` connected to the main repository at `/Users/eddylowen/code/open-source/webtides/element-library`.

---

*This file is meant to provide context to AI assistants. It should be updated as the project evolves.*

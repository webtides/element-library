# Contributing & Development

Thanks for your interest in contributing to `@webtides/element-library`! Please take a moment to review this document **before submitting a pull request**.

## Pull requests

**Please ask first before starting work on any significant new features.**

It's never a fun experience to have your pull request declined after investing a lot of time and effort into a new feature. To avoid this from happening, we request that contributors create [an issue](https://github.com/webtides/element-library/issues) to first discuss any significant new features.

## Local setup

Node `20.19+` is required (see `.nvmrc`).

```sh
nvm use            # or any tool that respects .nvmrc
npm install
npx playwright install --with-deps chromium
npm run dev        # Storybook on http://localhost:3000
```

## Coding standards

We use ESLint and Prettier to ensure consistent code quality. Both run automatically on staged files via Husky and `lint-staged` on commit.

To run the checks manually:

```sh
npm run lint
```

## Running tests

Tests run in a real browser (Chromium via Playwright) using Vitest's browser mode.

```sh
npm test               # run all tests once
npm run test:watch     # interactive watch mode
npm run test:coverage  # coverage report
npm run test:ui        # visual test runner
```

Please ensure tests pass before submitting a PR. New features should ship with both unit (`*.test.unit.js`) and feature (`*.test.feature.js`) tests.

## Git branching

We use a trunk-based development workflow.

> In the trunk-based development model, all developers work on a single branch with open access to it. Often it's simply the `main` branch. They commit code to it and run it. It's super simple. In some cases, they create short-lived feature branches. Once code on their branch compiles and passes all tests, they merge it straight to `main`. It ensures that development is truly continuous and prevents developers from creating merge conflicts that are difficult to resolve.

The trunk branch for this repo is `master`. As a release is complete the `master` branch is tagged with the new release version.

### Pull Requests

Pull requests should take place whenever a:

- FEATURE is about to be finished
- RELEASE is about to be finished

When all reviewers approve a PR, the feature/release may be merged.

## Versioning & releases

Tagging a commit with `v*` (e.g. `v0.2.0`) triggers the `Publish to npm` workflow, which runs the full test suite and then publishes to npm. The `NPM_TOKEN` secret must be configured on the repo for publishing to succeed.

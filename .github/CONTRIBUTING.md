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

## Changelog entries

Every PR that produces a user-visible change updates **two** changelogs under their `## Unreleased` heading:

1. The affected component's `src/components/<name>/<name>.changelog.md`.
2. The root `CHANGELOG.md`, grouped under an `### <component-name>` subsection.

A PR that touches multiple components updates each component's changelog and adds one subsection per component in the root. PRs without user-visible changes (refactors, internal tooling, docs-only) do not need changelog entries.

## Git branching

We use a trunk-based development workflow.

> In the trunk-based development model, all developers work on a single branch with open access to it. Often it's simply the `main` branch. They commit code to it and run it. It's super simple. In some cases, they create short-lived feature branches. Once code on their branch compiles and passes all tests, they merge it straight to `main`. It ensures that development is truly continuous and prevents developers from creating merge conflicts that are difficult to resolve.

The trunk branch for this repo is `main`. As a release is complete the `main` branch is tagged with the new release version.

### Pull Requests

Pull requests should take place whenever a:

- FEATURE is about to be finished
- RELEASE is about to be finished

When all reviewers approve a PR, the feature/release may be merged.

## Versioning & releases

Releases are cut manually — see [`RELEASING.md`](../RELEASING.md) for the step-by-step flow. In short: bump `package.json`, promote `Unreleased` to a dated version heading in the root and affected component changelogs, commit, tag `vX.Y.Z`, and push. The `Publish to npm` workflow fires on the `v*` tag, runs the full test suite, and publishes. The `NPM_TOKEN` secret must be configured on the repo for publishing to succeed.

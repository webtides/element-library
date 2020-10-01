# Contributing & Development

Thanks for your interest in contributing to `@webtides/element-library`! Please take a moment to review this document **before submitting a pull request**.

## Pull requests

**Please ask first before starting work on any significant new features.**

It's never a fun experience to have your pull request declined after investing a lot of time and effort into a new feature. To avoid this from happening, we request that contributors create [an issue](https://github.com/webtides/element-library/issues) to first discuss any significant new features.

## Coding standards

We use ESLint, Stylelint and Prettier to ensure good code quality.

ESLint, Stylelint & Prettier will run automatically when staging files via `git`.

## Running tests

You can run the test suite using the following commands:

```sh
npm test
```

Please ensure that the tests are passing when submitting a pull request. If you're adding new features to `@webtides/element-library`, please include tests.

## Git Branching

We use a trunk-based development workflow.

> In the trunk-based development model, all developers work on a single branch with open access to it. Often it’s simply the `main` branch. They commit code to it and run it. It’s super simple. In some cases, they create short-lived feature branches. Once code on their branch compiles and passes all tests, they merge it straight to `main`. It ensures that development is truly continuous and prevents developers from creating merge conflicts that are difficult to resolve.

As a Release is complete the `main` branch will be tagged with the new release version.

### Pull Requests

Pull requests should take place whenever a:

-   FEATURE is about to be finished
-   RELEASE is about to be finished

When all Reviewers approved a PR the feature/release may be finished locally and pushed to the remote

## Versioning

We use `lerna` to version and publish new releases for packages automatically when pushing changes to the `master` branch. To trigger a new release simply change the version in a package.json of an element or a package. The CI will pick it up and publish it.

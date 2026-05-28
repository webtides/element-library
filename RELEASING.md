# Releasing

Releases are cut manually. There is no release bot, no Changesets, no semantic release. The convention is the contract.

## During development (every PR)

Every PR that produces a user-visible change updates **two** changelogs under `## Unreleased`:

1. The affected component's `src/components/<name>/<name>.changelog.md`.
2. The root `CHANGELOG.md`, grouped under an `### <component-name>` subsection.

A PR that touches multiple components updates each component's changelog and adds one subsection per component in the root.

## Cutting a release

1. Make sure `main` is clean, pulled, and CI is green.
2. Pick the bump: `patch` for bugfixes, `minor` for additions, `major` for breaking changes. (Pre-1.0: breaking changes go in a `minor` bump.)
3. Edit `package.json` and set the new version (do not run `npm version` — it creates a tag from the pre-promotion commit; we want the promotion in the tagged commit).
4. In the root `CHANGELOG.md`, rename `## Unreleased` to `## [X.Y.Z] - YYYY-MM-DD`, keep its subsections, and add a fresh empty `## Unreleased` above it.
5. In every component changelog that had unreleased entries, do the same: promote `## Unreleased` to `## [X.Y.Z] - YYYY-MM-DD` and add a fresh `<!-- ## Unreleased -->` template above.
6. Run `npm install` once so `package-lock.json` picks up the new version.
7. Commit: `git commit -am "release: vX.Y.Z"`.
8. Tag: `git tag vX.Y.Z`.
9. Push: `git push --follow-tags`.

The `npm-publish.yml` workflow fires on the `v*` tag, runs the tests, and publishes to npm.

## Rollback

If a publish fails post-tag, fix forward — bump to the next patch and release again. Do not unpublish from npm (it breaks consumers) and do not move tags.

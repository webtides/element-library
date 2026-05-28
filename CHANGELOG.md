# Change Log

All notable changes to `@webtides/element-library` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/). Per-component changelogs live next to each component (`src/components/<name>/<name>.changelog.md`); this file is the aggregated, package-level view.

<!--
   PRs should add an entry to the Unreleased section below, grouped by component.
   Mirror the same entry in the component's own changelog. Uncomment subsection
   headings as needed.
-->

## Unreleased

### accordion-element

- Changed (BREAKING): renamed CSS parts `title-wrapper` → `title` and `content-wrapper` → `content`; the internal `.content-wrapper` class is now `.content`.

### select-field

- Changed (BREAKING): renamed the dropdown indicator's CSS class from `.icon` to `.dropdown-indicator`.

## [0.1.0] - TBD

Initial public release on npm under the consolidated single-package layout.

Pre-merge per-component release history is preserved in each component's `*.changelog.md` under the "Legacy (pre-merge)" heading.

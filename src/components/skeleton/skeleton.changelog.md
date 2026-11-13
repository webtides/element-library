# Change Log

All notable changes to this component live here. Versions refer to the parent `@webtides/element-library` release (see root [`CHANGELOG.md`](../../../CHANGELOG.md)); components no longer version independently.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

<!--
   When your PR touches this component, add an entry under Unreleased and
   mirror it (prefixed with the component name) in root CHANGELOG.md.
   Uncomment headings as needed.
-->

## Unreleased

### Added

- Initial `el-skeleton`: a quiet shape in the place of content that is still loading. It has no role and no content; the region that loads says so with `aria-busy`. ([#77](https://github.com/webtides/element-library/issues/77))
- A line by default: as wide as its container and `1em` high. A width and a height on the element make it a block, `--el-skeleton-radius` a circle.
- `effect` (`none`, `sheen`, `pulse`), reflected to an attribute of the same name. Both effects stand still for a user who prefers reduced motion.
- The colour is an eighth of the text colour, so the skeleton shows on any background and without a theme. `--el-skeleton-color` and `--el-skeleton-sheen-color` set other ones.

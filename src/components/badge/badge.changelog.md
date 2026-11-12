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

- Initial `el-badge`: a short label that marks something with a status or a count. Pure presentation, without a role and without behaviour. ([#74](https://github.com/webtides/element-library/issues/74))
- `variant` (`neutral`, `brand`, `success`, `warning`, `danger`) and `appearance` (`filled`, `outlined`, `plain`), the library's shared vocabulary, both reflected to attributes of the same name.
- `pill` for fully rounded ends. A badge with a single character is as wide as it is high: a square, and a circle as a pill.
- `pulse`: a ring in the colour of the variant spreads from the badge, again and again. It stands still for a user who prefers reduced motion.
- A badge is three quarters of the font size of the text it stands in, so it has no `size`.

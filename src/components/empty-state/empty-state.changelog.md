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

- Initial `el-empty-state`: what stands in the place of a list or a collection while there is nothing in it. Pure presentation, without a role and without behaviour. ([#83](https://github.com/webtides/element-library/issues/83))
- Four regions, each of them a slot: `icon`, `heading`, the message (the default slot) and `action`. A region that nothing is slotted into takes no space, on the server as in the browser, and comes and goes with its element.
- The content is a column in the middle, at most `30rem` wide. The message, the icon and the action have the muted text colour (`--el-color-fg-muted`), the heading has `--el-color-fg` and is semibold; the gaps and the padding come from the spacing tokens. No surface is painted.
- The action is an element of the page, a button with a listener of its own: the component has no properties and fires no event.

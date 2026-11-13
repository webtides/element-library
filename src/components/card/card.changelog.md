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

- Initial `el-card`: a surface that groups what belongs together, a form, a section of settings, an entry of a list. Pure presentation, without a role and without behaviour. ([#76](https://github.com/webtides/element-library/issues/76), [#81](https://github.com/webtides/element-library/issues/81))
- Four regions, each of them a slot: `media` at the top, then `header`, the body and `footer`. A region that nothing is slotted into takes no space, on the server as in the browser, and comes and goes with its element.
- `appearance` (`outlined`, `filled`, `plain`), reflected to an attribute of the same name. `outlined`, the default, is a surface in `--el-color-bg` with a border and the shadow `--el-shadow-md`; `filled` has the muted fill; `plain` paints nothing.
- `--el-card-padding` for the padding of the header, the body and the footer. Unset, it is `--el-space-4`. The parts `base`, `media`, `header`, `body` and `footer` reach one region alone.
- A card fills the height its container gives it: cards that a grid stretches are equally high, and their footers are in one line.

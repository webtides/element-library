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

- Initial `el-avatar`: the picture that stands for a person or a thing. It shows the first of these that it has: the `image`, the `initials`, an icon (the `icon` slot, and the outline of a person without it). ([#79](https://github.com/webtides/element-library/issues/79))
- An image that cannot be loaded makes way for the initials or the icon, also when it had failed in server-rendered markup before the element was there. A new address is tried again.
- `label`: with it the avatar is an image with that name for assistive technology; without it, it is hidden as a decoration beside a name that is written out.
- `shape` (`circle`, `square`, `rounded`) and `size` (`small`, `medium`, `large`), both reflected. The width and the height of an avatar are the control height of its size; `--el-avatar-size` makes it any other size, and the initials and the icon grow with it.
- The background is an eighth of the text colour, so the avatar shows on any background and without a theme.

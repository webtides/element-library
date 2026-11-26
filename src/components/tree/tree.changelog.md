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

- Initial `el-tree`: entries that open and close, for folders, categories and a library beside the content. The tree is a list (`role="list"`, named by `label`), every `el-tree-item` in it is an entry, and an entry holds the entries below it, to any depth. ([#193](https://github.com/webtides/element-library/issues/193))
- To assistive technology it is nested lists of links with a button per branch, not a `role="tree"`: the entries stay links, and they work before the script has run. The readme says why.
- The keys of the WAI-ARIA tree view pattern, on top of the Tab key: up and down between the entries that are shown, right opens a branch or goes into it, left closes it or goes to the entry above, Home and End. The other way round for left and right in a text that runs from right to left.
- `--el-tree-indent` is how far the entries of a level stand in from the ones above, `--el-space-4` unset.
- The tree keeps no state: which branches are open is the `open` attribute of the entries. `tree-item-toggle` of an entry bubbles through the tree.

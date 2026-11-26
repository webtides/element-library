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

- Initial `el-toolbar`: the row of controls over a list or a view. A toolbar for assistive technology (`role="toolbar"`, named by `label`), with what the page writes into it as its controls: `el-button`, `el-button-group`, `el-segmented-field`, and `el-divider` between two groups. ([#194](https://github.com/webtides/element-library/issues/194))
- `size` and `appearance` are the size and the appearance of the controls that have none of their own: of every `el-button` in the toolbar, also inside of a group, and `size` of an `el-segmented-field`. A toolbar that names none has controls of the medium size and plain buttons. A control that names its own keeps it, the defaults included. The toolbar does not write to its controls: it says both in CSS properties that are inherited.
- The controls stand in a row with a gap of `--el-space-2`. What is slotted into `end` stands at the end; start and end follow the reading direction. A toolbar with more controls than its width takes breaks into a second line.
- One stop of the Tab key, as the WAI-ARIA toolbar pattern says: the arrow keys move the focus between the controls and around the ends, Home and End go to the first and the last one, and Tab leaves the toolbar and comes back to the control that had the focus last. The options of an `el-segmented-field` are controls of the toolbar: the left and right arrow keys go through them, Space and the up and down keys choose. In a control that takes text the keys belong to that control.
- An `el-button` with an `aria-label`, a button with an icon alone, shows that name as a tooltip, for the pointer and for the focus of the keyboard. The tooltips are `el-tooltip` elements in the shadow root of the toolbar (`::part(tooltip)`); the toolbar imports the tooltip, and with it `@floating-ui/dom`.
- The look is the stylesheets alone: a server-rendered toolbar does not change when the elements take over. The script adds the keyboard and the tooltips.

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

- `anchor`: the anchor as an element, for one that an id cannot name: an element in another tree than the tooltip, the light DOM of a component whose shadow root the tooltip is in. A property only, and it comes before `for`. ([#194](https://github.com/webtides/element-library/issues/194))
- `type` (`'description'` by default, or `'label'`): a tooltip of the type `label` shows the name its anchor already has, of a button with an icon alone for example. It does not describe the anchor (`aria-describedby` is not written) and is hidden from assistive technology, which would read the name twice. ([#194](https://github.com/webtides/element-library/issues/194))

### Fixed

- In Safari a tooltip could stay shown after its anchor had lost the pointer or the focus: `open` was `false`, and the tooltip was still there. The tooltip read its own state back (`states.has('open')`) to know whether there was something to close, and WebKit forgets what was added to the states of an element a moment later, while `:state(open)` still matches. The tooltip keeps a field of its own now.

## [0.3.0] - 2026-11-17

### Added

- Initial `el-tooltip`: a short text that explains another element, its anchor. It stands next to the anchor in the page and names it by id with `for`, the way a `<label>` names its field. ([#71](https://github.com/webtides/element-library/issues/71))
- Opens while the pointer rests on the anchor (after `show-delay`, 150 ms by default) or while the anchor has the focus of the keyboard (at once); closes when they leave (after `hide-delay`) or with `Escape`. The pointer can go from the anchor onto the text without the tooltip closing. A finger opens nothing.
- The tooltip is the description of its anchor for a screen reader (`aria-describedby`), open or closed, also for an `el-button`. It has the role `tooltip`.
- The element is a native popover of the platform (`popover="manual"`), in the top layer: nothing clips the tooltip or lies on top of it.
- `placement` (`top`, `bottom`, `left`, `right`, each also with `-start` or `-end`; `top` by default), `distance` (8 px by default) and `arrow`, as for `el-popover`. The tooltip goes to the opposite side when it has no room, stays inside the viewport, and follows its anchor while it is open.
- `open` (reflected, with the `open` custom state), `show()` and `hide()`, and the events `tooltip-show` and `tooltip-hide`. With `disabled` the pointer and the focus neither open nor close the tooltip, and it is left to a script.

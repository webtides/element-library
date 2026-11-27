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

- Initial `el-app-frame`: the frame of an application. It fills what the browser shows and lays out five regions, a header, a footer, a navigation at the start side, an aside at the end side, and the content. A region the page leaves empty takes no room, and start and end follow the reading direction. ([#176](https://github.com/webtides/element-library/issues/176))
- The frame is fixed to the edges of the viewport, which move with the address bar of a phone: it is as high as what the browser shows, and no higher. The content scrolls between the header and the footer, which stay in view. The window does not scroll in a frame; `scroller` is the element that does, for a page that sets the scroll back after a change of the view.
- Narrow and wide by its own width: from the width `wide-from` names (`30rem`, `40rem`, `48rem` by default, `64rem` or `80rem`) the navigation and the aside are columns beside the content, and each scrolls on its own. Below it the content and the aside are one column that scrolls, and the navigation is a drawer. The stylesheet decides, with a container query per step, so a server-rendered frame has its layout before the script has run. `wide` reads what the stylesheet has decided.
- `--el-app-frame-navigation-size` (`16rem`) and `--el-app-frame-aside-size` (`20rem`) are the widths of the two columns.
- The page writes the landmarks: `<header slot="header">`, `<nav slot="navigation" aria-label="…">`, `<main id="…">`, `<aside slot="aside">` and `<footer slot="footer">`. The frame adds none of its own.
- The first stop of the Tab key is a link that skips to the content, with the text of `skip-label`. It is a link to the id of the `main` of the page, which works before the script has run. After it the content is in view from its start, the keys scroll it, and the Tab key goes on inside of it.
- On a phone with `viewport-fit=cover` nothing in a region lies under the notch, the rounded corners or the home indicator. The surface of a region (`::part(header)`, `::part(footer)`, …) reaches the edge of the screen, and what is in it does not. A region tells the components in it how far its surface reaches, and that it draws the line to the content itself, in CSS properties that are inherited.
- A region that scrolls and has nothing in it that takes the focus is a stop of the Tab key itself, so the keyboard can scroll it in every browser.
- On paper the frame is as long as its content, which prints whole.
- Lines between the regions from `--el-color-border` and `--el-border-width`. They are borders, which stay where the user forces colours, and they are there without a theme then. Without a theme the frame paints nothing.
- `narrow-only` and `wide-only` name the regions that are there at one width only (`header`, `navigation`, `aside`, `footer`, with a space between them): a bar of destinations in the footer of a phone, for example (`narrow-only="footer"`), or an aside for a desktop (`wide-only="aside"`). The stylesheet leaves a region out, without a script, and the frame keeps the edge of the screen clear that the region kept clear. ([#179](https://github.com/webtides/element-library/issues/179))
- Where the frame is narrow, the navigation does not show and opens as a drawer from the start edge. The page writes the navigation once: the element in the `navigation` slot is the column of the wide frame and the content of the drawer of the narrow one, and no node is moved. ([#177](https://github.com/webtides/element-library/issues/177))
- Any element with `data-navigation-toggle` in the frame opens and closes that drawer. The frame writes `aria-expanded` onto it, and it is not there where the navigation is a column: an `el-button` by the stylesheet of the frame, before any script has run, another element by the script (`hidden`).
- The drawer is an `el-drawer`: modal, with the focus kept in it. `Escape`, its close button and a click beside it close it, and the focus goes back to the button that opened it. A link the user follows in it closes it, also where the page takes the click. `navigation-label` is its title and `close-label` the name of its close button; its parts are `drawer`, `drawer-header`, `drawer-title`, `drawer-close-button` and `drawer-body`.
- A change of the width while the drawer is open leaves nothing behind: no backdrop, no lock on the scroll of the page and no inert page.
- `navigation-open` opens and closes the drawer from a script, `app-frame-navigation-toggle` tells of both, and `:state(navigation-open)` matches while it is open.
- `narrow-navigation="bar"`: where the frame is narrow, the navigation lies at the lower edge, over the footer, instead of being a drawer. For an `el-nav` in the `navigation` slot, whose destinations are a bar there and a rail in the column of the wide frame: the page writes them once. The region is a surface of the frame at the lower edge, as the footer is, and the column is as wide as what is in it. ([#181](https://github.com/webtides/element-library/issues/181))
- The column of the navigation tells an `el-nav` in it to be a column (a rail, or the list its `column` asks for), and that the region draws the line to the content, in CSS properties that are inherited. The drawer of the navigation says the same.
- `resizable` names the columns whose width the user sets by dragging their edge (`navigation`, `aside`). The edge is an `el-splitter` of the frame at the side of the column that faces the content: dragged with a mouse, a finger or a pen, a stop of the Tab key with the arrow keys, `Home` and `End`, and a separator with the width and the name of the column for assistive technology (`navigation-label`, and the new `aside-label`). Its parts are `navigation-splitter` and `aside-splitter`. ([#182](https://github.com/webtides/element-library/issues/182))
- `navigation-size` and `aside-size` are the widths of the two columns in pixels. The frame sets them while the user drags, `app-frame-resize` tells of every width and `app-frame-resize-end` of the one that stays (`detail.region`, `detail.size`). The page keeps the width and gives it back in the attribute: the template writes it onto the grid, so a server-rendered frame has it before the script has run.
- `--el-app-frame-navigation-min-size`, `--el-app-frame-navigation-max-size`, `--el-app-frame-aside-min-size` and `--el-app-frame-aside-max-size` are the limits of a column that is resizable (`10rem`, and `min(30rem, 40cqi)`: two fifths of the width of the frame at most). The stylesheet holds a width that is kept between them.
- Where the frame is narrow, a column has no edge to drag, and the drawer of the navigation keeps the width of the stylesheet.

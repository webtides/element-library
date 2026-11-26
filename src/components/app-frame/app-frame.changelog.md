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
- Narrow and wide by its own width: from the width `wide-from` names (`30rem`, `40rem`, `48rem` by default, `64rem` or `80rem`) the navigation and the aside are columns beside the content, and each scrolls on its own. Below it the three are one column that scrolls. The stylesheet decides, with a container query per step, so a server-rendered frame has its layout before the script has run. `wide` reads what the stylesheet has decided.
- `--el-app-frame-navigation-size` (`16rem`) and `--el-app-frame-aside-size` (`20rem`) are the widths of the two columns.
- The page writes the landmarks: `<header slot="header">`, `<nav slot="navigation" aria-label="…">`, `<main id="…">`, `<aside slot="aside">` and `<footer slot="footer">`. The frame adds none of its own.
- The first stop of the Tab key is a link that skips to the content, with the text of `skip-label`. It is a link to the id of the `main` of the page, which works before the script has run. After it the content is in view from its start, the keys scroll it, and the Tab key goes on inside of it.
- On a phone with `viewport-fit=cover` nothing in a region lies under the notch, the rounded corners or the home indicator. The surface of a region (`::part(header)`, `::part(footer)`, …) reaches the edge of the screen, and what is in it does not. A region tells the components in it how far its surface reaches, and that it draws the line to the content itself, in CSS properties that are inherited.
- A region that scrolls and has nothing in it that takes the focus is a stop of the Tab key itself, so the keyboard can scroll it in every browser.
- On paper the frame is as long as its content, which prints whole.
- Lines between the regions from `--el-color-border` and `--el-border-width`. They are borders, which stay where the user forces colours, and they are there without a theme then. Without a theme the frame paints nothing.

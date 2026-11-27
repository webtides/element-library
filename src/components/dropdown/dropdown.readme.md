# Dropdown

`dropdown` is a component that shows and hides a panel for a trigger, with trigger and content slots. It closes when the user clicks outside or presses the Escape key.

The panel is in the flow of the page: it takes room below its trigger, and what follows moves down. That is what the dropdown is for, a part of the page that opens in its place. For the two things it is often taken for, there are elements of their own:

- **A menu of actions** behind a button is an [`el-menu`](../menu/menu.readme.md): entries with roles, the keyboard through them, and a panel that floats.
- **A panel that floats** next to its anchor, with any content, is an [`el-popover`](../popover/popover.readme.md).

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/dropdown/define';
```

```html
<el-dropdown>
    <button slot="trigger">Open Menu</button>
    <div slot="content">
        <a href="#">Menu Item 1</a>
        <a href="#">Menu Item 2</a>
        <a href="#">Menu Item 3</a>
    </div>
</el-dropdown>
```

## API

#### Properties/Attribute

| Name   | Type      | Default | Description                                                 |
| ------ | --------- | ------- | ----------------------------------------------------------- |
| `open` | `boolean` | `false` | Controls whether the dropdown content is visible or hidden. |

#### Methods

_None_

#### Events

_None_

#### CSS Parts

| Name      | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `trigger` | The `<slot>` holding the trigger element.                   |
| `panel`   | The floating container rendered while the dropdown is open. |
| `content` | The `<slot>` holding the dropdown content.                  |

#### CSS States

| Name   | Description                                                                           |
| ------ | ------------------------------------------------------------------------------------- |
| `open` | Present on the host while the dropdown is open. Style with `el-dropdown:state(open)`. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-lg`, `--el-shadow-lg`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

#### Slots

| Name | Description |
| --- | --- |
| `trigger` | The element that opens the dropdown when clicked. Automatically has the `show-dropdown` attribute applied. |
| `content` | The dropdown content that appears when the dropdown is open. Only rendered when `open` is `true`. |

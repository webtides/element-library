# Dropdown

`dropdown` is a component that creates a toggleable dropdown menu with trigger and content slots. It handles click-outside and escape key interactions to automatically close the dropdown when the user clicks outside or presses the Escape key.

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

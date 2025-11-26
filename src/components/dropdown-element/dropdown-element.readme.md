# DropdownElement

`dropdown-element` is a component that creates a toggleable dropdown menu with trigger and content slots. It handles click-outside and escape key interactions to automatically close the dropdown when the user clicks outside or presses the Escape key.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/src/components/dropdown-element/dropdown-element.js';
```

```html
<el-dropdown-element>
    <button slot="trigger">Open Menu</button>
    <div slot="content">
        <a href="#">Menu Item 1</a>
        <a href="#">Menu Item 2</a>
        <a href="#">Menu Item 3</a>
    </div>
</el-dropdown-element>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Controls whether the dropdown content is visible or hidden. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

| Name | Description |
| --- | --- |
| `trigger` | The element that opens the dropdown when clicked. Automatically has the `show-dropdown` attribute applied. |
| `content` | The dropdown content that appears when the dropdown is open. Only rendered when `open` is `true`. |

# SvgUse

`svg-use` is a component that simplifies the use of SVG icons from sprite sheets. It wraps the SVG `<use>` element to reference symbols from either an external sprite file or embedded SVG sprites in the document.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/svg-use/define';
```

```html
<!-- Using an external sprite file -->
<el-svg-use name="icon-home" sprite-path="/assets/icons.svg"></el-svg-use>

<!-- Using an embedded sprite (no sprite-path needed) -->
<el-svg-use name="icon-search"></el-svg-use>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | `''` | The ID of the SVG symbol to display from the sprite. This corresponds to the `id` attribute of a `<symbol>` element in the SVG sprite. |
| `spritePath` | `string` | `''` | The path to an external SVG sprite file. If empty, the component assumes the sprite is embedded in the parent document. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

_None_

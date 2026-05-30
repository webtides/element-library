# Sticky

`sticky` is a component that creates smart sticky positioning behavior. It automatically toggles custom states based on scroll position and direction, allowing you to create headers or navigation elements that stick to the top of the viewport and can hide/show based on scroll direction.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/sticky/define';
```

```html
<el-sticky>
    <nav>
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </nav>
</el-sticky>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `forceDown` | `boolean` | `false` | When set to `true`, prevents the element from hiding when scrolling up. Useful for keeping navigation always visible. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--sticky-height` | Auto-calculated | The height of the sticky element. Automatically set by the component using ResizeObserver. Used for transform calculations. |

#### Slots

_None_ (uses default slot for content)

#### CSS States

The component automatically toggles these custom states based on scroll behavior. Style them with `el-sticky:state(sticky)`, `el-sticky:state(up)`, etc.:

| State    | Description                                               |
| -------- | --------------------------------------------------------- |
| `sticky` | Set once the page has scrolled past the element's height. |
| `up`     | Set when scrolling up.                                    |
| `down`   | Set when scrolling down.                                  |

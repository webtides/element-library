# StickyElement

`sticky-element` is a component that creates smart sticky positioning behavior. It automatically adds CSS classes based on scroll position and direction, allowing you to create headers or navigation elements that stick to the top of the viewport and can hide/show based on scroll direction.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/sticky-element/define';
```

```html
<el-sticky-element>
    <nav>
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </nav>
</el-sticky-element>
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

#### CSS Classes

The component automatically adds these classes based on scroll behavior:

| Class       | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| `is-sticky` | Added when the page has scrolled past the element's height. |
| `is-up`     | Added when scrolling up.                                    |
| `is-down`   | Added when scrolling down.                                  |

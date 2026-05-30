# LazySrc

`lazy-src` is a lazy-loading wrapper for media elements. Place any `<img>`, `<picture>`, `<iframe>`, or `<video>` inside with a `data-src` attribute instead of `src`, and it loads the resource on demand once the element scrolls into view. It is backed by [lozad](https://github.com/ApoorvSaxena/lozad).

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/lazy-src/define';
```

```html
<el-lazy-src>
    <img data-src="url-to-image" />
</el-lazy-src>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `rootMargin` | `string` | `'0px'` | Delegated to the internal [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver). |
| `threshold` | `number \| array` | `0.01` | Delegated to the internal [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver). |
| `loaded` | `boolean` | `false` | Indicates whether the element has been loaded or not. |
| `imgClass` | `string` | `''` | When set, the value is applied as the `class` attribute on the inner `<img>` once it loads. |
| `imgAlt` | `string` | `''` | When set, the value is applied as the `alt` attribute on the inner `<img>` once it loads. |

#### Methods

| Name             | Parameters | Description                                     |
| ---------------- | ---------- | ----------------------------------------------- |
| `api` _(getter)_ | None       | Returns the underlying lozad observer instance. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `LazySrcLoad` | `this` | Fired when the element intersects the viewport and loading is triggered. Bubbles up through the DOM. |
| `LazySrcImgLoad` | `this` | Fired when the inner `<img>` has finished loading. Bubbles up through the DOM. |
| `LazySrcImgError` | `this` | Fired when the inner `<img>` fails to load. Bubbles up through the DOM. |

#### CSS States

| Name     | Description                                                                        |
| -------- | ---------------------------------------------------------------------------------- |
| `loaded` | Present once the lazy resource has loaded. Style with `el-lazy-src:state(loaded)`. |

#### CSS Custom Properties

_None_

#### Slots

_None_

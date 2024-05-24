# LazySrc

`lazy-src` enables you to lazy load child elements with a `src` attribute. Place any `<img>`, `<picture>`, `<iframe>`, or `<video>` element inside with a `data-src` attribute instead of the `src` attribute and `lazy-src` will load it on demand when the element becomes visible in the viewport.

## How to use

#### Installation

```sh
npm i --save @webtides/lazy-src
```

#### Use

```js
import '@webtides/lazy-src';
```

```html
<lazy-src>
    <img data-src="url-to-image" />
</lazy-src>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `rootMargin` | `string` | `'0px'` | Delegates to internal [`IndersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver) |
| `threshold` | `number | array` | `0.01` | Delegates to internal [`IndersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver) |
| `loaded` | `boolean` | `false` | Indicates whether the element has been loaded or not. |

#### Methods

_None_

#### Events

_None_

<!-- TODO: should send event when element was loaded... -->

#### CSS Custom Properties

_None_

#### Slots

_None_

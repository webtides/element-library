# ScrollTo

`scroll-to` is a wrapper that smoothly scrolls to another element on the page. Point it at a target with any CSS selector; any `click`-emitting child element (e.g. `<a>` or `<button>`) triggers the scroll.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/scroll-to/define';
```

```html
<el-scroll-to selector="#highlights-section">
    <a>Highlights</a>
</el-scroll-to>
<!-- some in between content ... -->
<section id="highlights-section"></section>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `''` | A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString) containing one selector to match. This string must be a valid CSS selector string. See [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for more about selectors and how to manage them. |
| `preventDefault` | `boolean` | `true` | The Event interface's preventDefault() method tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be. The event continues to propagate as usual. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

_None_

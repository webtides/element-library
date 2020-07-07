# ScrollTo

`scroll-to` is an element that allows you to smoothly scroll to any other element on the page.
Use any regular DOM query selector to point to targeting elements. Any `click` event emitting child elements such as
<a>, <button>, etc will trigger the `scroll-to`.

## How to use

#### Install

```sh
npm i --save @webtides/scroll-to
```

#### Use

```js
import '@webtides/scroll-to';
```

```html
<scroll-to selector="#highlights-section">
    <a>Highlights</a>
</scroll-to>
<!-- some in between content ... -->
<section id="highlights-section"></section>
```

## API

#### Properties/Attribute

| Name             | Type      | Default | Description                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`       | `string`  | `''`    | A [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString) containing one selector to match. This string must be a valid CSS selector string. See [Locating DOM elements using selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for more about selectors and how to manage them. |
| `preventDefault` | `boolean` | `true`  | The Event interface's preventDefault() method tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be. The event continues to propagate as usual.                                                                                                                                          |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

_None_

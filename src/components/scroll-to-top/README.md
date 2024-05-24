# ScrollToTop

`scroll-to-top` enables you to smoothly scroll to the top of the page. Place any `click` event emitting child element inside such as `<a>`, `<button>`, etc. If a `click` event gets fired, `scroll-to-top` will capture it and scroll to top.

## How to use

#### Installation

```sh
npm i --save @webtides/scroll-to-top
```

#### use

```js
import '@webtides/scroll-to-top';
```

```html
<scroll-to-top>
    <button>Scroll to top</button>
</scroll-to-top>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` | `1000` | Time in milliseconds the animation should take. |
| `preventDefault` | `boolean` | `true` | The Event interface's preventDefault() method tells the user agent that if the event does not get explicitly handled, its default action should not be taken as it normally would be. The event continues to propagate as usual. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

_None_

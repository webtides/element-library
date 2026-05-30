# ScrollToTop

`scroll-to-top` is a wrapper that smoothly scrolls the page to the top. Place any `click`-emitting child element inside (e.g. `<a>` or `<button>`); when it fires a `click`, `scroll-to-top` captures it and scrolls to the top.

## How to use

#### Installation

```sh
npm i --save @webtides/element-library
```

#### use

```js
import '@webtides/element-library/scroll-to-top/define';
```

```html
<el-scroll-to-top>
    <button>Scroll to top</button>
</el-scroll-to-top>
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

# Carousel

`carousel` is a carousel/slider component backed by [Glide.js](https://glidejs.com/). Direct children of the host element are treated as slides; the component renders Glide's controls (navigation arrows and bullet pager) inside the shadow DOM around them.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/carousel/define';
```

```html
<el-carousel>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
</el-carousel>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `object` | `{}` | Options forwarded to the Glide constructor. Merged on top of the component's defaults (`type: 'carousel'`, `perView: 1`, `startAt: 0`, `keyboard: false`). See the [Glide options](https://glidejs.com/docs/options/). |
| `disabled` | `boolean` | `false` | When `true`, Glide is not mounted and slides render as a plain list (useful for SSR or feature-flagging the carousel off). |
| `slidePrefix` | `string` | `'slide'` | Prefix used when generating per-slide identifiers. |
| `bullets` | `boolean` | `true` | Whether to render the bullet pager. |
| `arrows` | `boolean` | `true` | Whether to render the previous/next navigation arrows. |

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `next()` | None | Advance to the next slide. |
| `prev()` | None | Move to the previous slide. |
| `api` _(getter)_ | None | Returns the underlying Glide instance for external navigation/configuration. Falls back to a no-op `{ go() }` stub while Glide is not mounted (e.g. when `disabled`). |

#### Events

| Name          | Detail   | Description                                                                          |
| ------------- | -------- | ------------------------------------------------------------------------------------ |
| `CarouselRun` | `number` | Fired on every Glide `run` (slide change). The detail is the new active slide index. |

#### Slots

| Name          | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| _(default)_   | Direct children become slides (unless they have a `slot` attribute or are Glide clones). |
| `arrow-left`  | Content of the "previous" navigation button.                                             |
| `arrow-right` | Content of the "next" navigation button.                                                 |

#### CSS Parts

| Name           | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `track`        | The Glide track wrapper.                                       |
| `slides`       | The slides container.                                          |
| `arrows`       | The navigation arrows wrapper.                                 |
| `arrow`        | Applied to both arrow buttons.                                 |
| `arrow-left`   | Applied to the previous-slide button (in addition to `arrow`). |
| `arrow-right`  | Applied to the next-slide button (in addition to `arrow`).     |
| `dots`         | The bullet pager wrapper.                                      |
| `dot`          | Applied to each bullet.                                        |
| `selected-dot` | Added to the bullet representing the active slide.             |

#### CSS Custom Properties

_None_

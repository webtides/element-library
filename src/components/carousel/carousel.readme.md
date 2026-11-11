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

| Name | Description |
| --- | --- |
| _(default)_ | Direct children become slides (unless they have a `slot` attribute). |
| `arrow-left` | Content of the "previous" navigation button; it names the button. Left empty, the button is named "Previous slide" for screen readers and shows nothing. |
| `arrow-right` | Content of the "next" navigation button; it names the button. Left empty, the button is named "Next slide" for screen readers and shows nothing. |

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

`--el-touch-target` is the only design token this component reads. On a touch screen (`@media (any-pointer: coarse)`) the arrows are at least that wide and high. The bullets keep their size: each gets a hit area of `--el-touch-target` around its dot, the bullets move apart by as much, and their row wraps when it gets wider than the carousel. Without that token, and on a fine pointer, the sizes stay as they are.

## Looping, and server-rendered slides

To loop, Glide shows copies of the first and the last slides beyond the two ends. The carousel keeps these copies in its shadow root. The children of the element stay exactly what the page wrote, so a framework can hydrate a server-rendered carousel whose slides come from a loop (`{#each}` in Svelte), also when the element has started before the framework does.

The copies are outside the page's DOM, which matters for their styles:

- A rule of the page's style sheets styles a copy when it selects the slide without an ancestor outside the carousel: a class on the slide (`.slide`, utility classes) or on something inside it works, `el-carousel > div` or `.gallery .slide` does not. Inherited values such as the text color and the font, and custom properties, reach the copies either way.
- The carousel hands the style sheets of the document to its shadow root (`adoptGlobalStyles` of element-js). Sheets that are added after the page has loaded are only picked up with `globalThis.elementJsConfig = { observeGlobalStyles: true }`.
- An `id` or a form control inside a slide exists once more in each copy, in the shadow root, where it does not clash with the page.

A carousel with `options='{"type": "slider"}'` does not loop and has no copies.

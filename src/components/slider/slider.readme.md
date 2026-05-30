# Slider

`slider` is a CSS-scroll-snap based carousel. Direct children matched by `itemSelector` are arranged horizontally and navigated via the rendered dot pager and arrow buttons, by setting `selectedIndex`, or by calling `next()` / `previous()` / `goTo()`.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/slider/define';
```

```html
<el-slider>
    <li class="item">1</li>
    <li class="item">2</li>
    <li class="item">3</li>
</el-slider>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `itemSelector` | `string` | `'.item'` | CSS selector used to find item nodes among the slotted children. |
| `itemsToShow` | `number` | `1` | Number of items visible per slide step. Used to compute the per-item width. |
| `itemsToScroll` | `number` | `1` | Number of items advanced by each `next()` / `previous()` call. |
| `rewind` | `boolean` | `false` | When `true`, navigating past the last (or before the first) item wraps around. |
| `selectedIndex` | `number` | `0` | Currently focused item index. |
| `autoSelect` | `boolean` | `false` | When `true`, navigation skips items that are already fully visible. |
| `dots` | `boolean` | `true` | Whether to render the dot pager. |
| `arrows` | `boolean` | `true` | Whether to render the previous/next arrow buttons. |
| `setIndexAfterResize` | `boolean` | `true` | When `true`, the slider re-aligns to `selectedIndex` after the host resizes. |
| `manualScrollEndDelay` | `number` | `200` | Debounce window (ms) used to detect the end of a manual scroll. |

#### Methods

| Name | Parameters | Description |
| --- | --- | --- |
| `next()` | None | Advance to the next item (by `itemsToScroll`). |
| `previous()` | None | Move to the previous item (by `itemsToScroll`). |
| `goTo(index, smooth?)` | `index: number`, `smooth: boolean = true` | Jump to a specific item index, optionally with smooth scrolling. |
| `canSlide` _(getter)_ | None | `true` when the slider's content overflows its viewport (i.e. there is anything to scroll through). |
| `canSlideLeft` _(getter)_ | None | `true` when `selectedIndex` can be decremented. |
| `canSlideRight` _(getter)_ | None | `true` when `selectedIndex` can be incremented. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `SliderRun` | `number` | Fired when `selectedIndex` changes. The detail is the new index. |
| `SliderResize` | `number` | Fired after the host element resizes and the slider re-aligns to the current index. The detail is the current index. |

#### Slots

| Name          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| _(default)_   | Place item nodes here; each must match `itemSelector`.         |
| `arrow-left`  | Content of the "previous" navigation button (defaults to `⟨`). |
| `arrow-right` | Content of the "next" navigation button (defaults to `⟩`).     |

#### CSS Parts

| Name             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `scroller`       | The horizontally scrolling track.                         |
| `controls`       | Applied to both the dots wrapper and the arrows wrapper.  |
| `dots`           | The dot pager wrapper.                                    |
| `dot`            | Applied to each pager dot.                                |
| `selected-dot`   | Added to the dot representing the active slide.           |
| `arrows`         | The arrow buttons wrapper.                                |
| `arrow`          | Applied to both arrow buttons.                            |
| `arrow-left`     | Applied to the previous button (in addition to `arrow`).  |
| `arrow-right`    | Applied to the next button (in addition to `arrow`).      |
| `arrow-disabled` | Added to an arrow button when it cannot navigate further. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-accent`, `--el-color-border`, `--el-radius-md`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

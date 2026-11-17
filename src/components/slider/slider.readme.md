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
| `dotLabel` | `string` | `'Go to item'` | Accessible label of a pager dot, followed by the number of its item (`'Go to item 2'`). Set it as `dot-label`. |
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

| Name | Description |
| --- | --- |
| _(default)_ | Place item nodes here; each must match `itemSelector`. |
| `arrow-left` | Content of the "previous" navigation button; it names the button. Left empty, the button shows an arrow head and is named "Previous item" for screen readers. |
| `arrow-right` | Content of the "next" navigation button; it names the button. Left empty, the button shows an arrow head and is named "Next item" for screen readers. |

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

The arrows and the dots have the look and the place of the shared style of the library, the same as in `el-carousel`, and read the `--el-*` design tokens:

- **Arrows**: buttons on the scroller, in the middle of its height, `--el-space-2` in from its two sides. A square of `--el-control-height` with the surface `--el-color-bg`, the text colour `--el-color-fg`, a border of `--el-border-width` in `--el-color-border` and the radius `--el-radius-md`. Without a theme the surface and the text colour are the ones of the browser for the colour scheme (`Canvas`, `CanvasText`). The keyboard focus shows as a ring inside of the arrow (`--el-focus-ring-width`, `--el-color-focus-ring`, the text colour of the arrow without that token): around it, the ring would lie on the item. An arrow that leads nowhere keeps its surface, and its sign fades.
- **Dots**: a row under the scroller, in the middle, so that no dot lies on a item. A dot is a ring of 10 px in `--el-color-fg-muted`, the one of the item that shows a disc in `--el-color-accent`; without a theme both have the text colour of the page. A click counts in a square of 24 px around a dot, and the dots are that far apart. The keyboard focus of a dot shows as a ring around it.

On a touch screen (`@media (any-pointer: coarse)`) the arrows are at least `--el-touch-target` wide and high. The dots keep their size: each gets a hit area of `--el-touch-target` around it, the dots move apart by as much, and their row wraps when it gets wider than the slider. Without that token, and on a fine pointer, the sizes stay as they are.

A page reaches every one of them with `::part()`. Dots that lie on the items, over pictures for example, take one rule. Their colours are then for the page to choose, which knows what its items show:

```css
el-slider::part(dots) {
    grid-area: 1 / 1;
    align-self: end;
    z-index: 1;
}
```

## Accessibility

- The scroller can be focused with the keyboard, where the arrow keys scroll it.
- Each pager dot is a button named by `dot-label` and the number of its item; `aria-pressed` marks the dot of the selected item.
- The arrows are buttons named "Previous item" and "Next item", or by what is in their slots. The arrow that leads nowhere is disabled.

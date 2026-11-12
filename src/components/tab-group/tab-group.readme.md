# TabGroup

`tab-group` is a container that pairs `<el-tab-link>` children with `<el-tab-panel>` children and shows one panel at a time. It listens for `tab-select` events bubbled from `<el-tab-link>` and mirrors the active selection onto the `selected` attribute (reflected). When no tab is selected declaratively, the first panel is shown.

The group also wires the tabs for the keyboard and for screen readers, see [Accessibility](#accessibility). For that, the links belong into an element of their own, as in the example below: the group makes it the `tablist`.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tab-group/define';
```

```html
<el-tab-group selected="general">
    <div>
        <el-tab-link for="general">General</el-tab-link>
        <el-tab-link for="custom">Custom</el-tab-link>
        <el-tab-link for="advanced">Advanced</el-tab-link>
        <el-tab-link for="disabled" disabled>Disabled</el-tab-link>
    </div>

    <el-tab-panel name="general">This is the general tab panel.</el-tab-panel>
    <el-tab-panel name="custom">This is the custom tab panel.</el-tab-panel>
    <el-tab-panel name="advanced">This is the advanced tab panel.</el-tab-panel>
    <el-tab-panel name="disabled">This is a disabled tab panel.</el-tab-panel>
</el-tab-group>
```

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `selected` | `string \| undefined` | `undefined` | Name of the currently selected tab. Matches an `<el-tab-panel>`'s `name`. Reflected to the `selected` attribute. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction of the links: the left and right arrow keys move between them, or the up and down keys when `'vertical'`. |
| `linkSelector` | `string` | `'el-tab-link'` | Selector used to find tab link children. |
| `panelSelector` | `string` | `'el-tab-panel'` | Selector used to find tab panel children. |

#### Methods

| Name              | Parameters     | Description                                              |
| ----------------- | -------------- | -------------------------------------------------------- |
| `selectTab(name)` | `name: string` | Programmatically activate the panel with the given name. |

#### Events

_None_ (listens to `tab-select` events from child `<el-tab-link>` elements)

#### CSS Custom Properties

_None_

#### Slots

| Name        | Description                                        |
| ----------- | -------------------------------------------------- |
| _(default)_ | The `<el-tab-link>` and `<el-tab-panel>` children. |

## Lazy definition and parts that come later

The group does not need its links and panels to be defined, or to be there, when it starts.

- `el-tab-group`, `el-tab-link` and `el-tab-panel` can be defined in any order, for example each by itself when a loader finds its tag on the page. The group marks the selection with attributes and styles, which reach a link or a panel before its tag is defined; `el-tab-link` shows its `active` state from `aria-selected` as soon as it is defined.
- Links and panels that are added to the group later are taken in. A group that has no panel at first selects the first one that comes, unless `selected` is set.
- An element of your own that is used as a link (`link-selector`) gets `aria-selected` and `tabindex` from the group as well. The `active` state is set by `el-tab-link` only; style another element with `[aria-selected='true']`.

## Accessibility

- The element around the links gets `role="tablist"` and `aria-orientation`, unless the page gave it another role. Links that are direct children of the group have no such element; the group cannot be the list itself, because it holds the panels as well. Their keys and states work all the same, but a `tab` outside a `tablist` is not valid ARIA, and axe reports it (`aria-required-parent`).
- The selected link has `aria-selected="true"` and is the only link in the tab order (`tabindex="0"`, the others `-1`). The Tab key enters the links at the selected one and leaves them for the panel.
- The arrow keys move to the next and the previous link and select it: left and right, or up and down with `orientation="vertical"`. They wrap around at the ends. Home and End go to the first and the last link. Disabled links are skipped.
- Enter and Space select the focused link.
- Every panel is labelled by its link (`aria-labelledby`). A link without an `id` gets one.

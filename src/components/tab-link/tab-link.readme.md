# TabLink

`tab-link` is a clickable label for a `<el-tab-panel>`. It dispatches a bubbling `tab-select` event with `detail.selected` set to its `for` attribute when clicked (unless `disabled`). It is used inside a `<el-tab-group>`.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tab-link/define';
```

```html
<el-tab-group selected="general">
    <el-tab-link for="general">General</el-tab-link>
    <el-tab-link for="custom">Custom</el-tab-link>
    <el-tab-link for="advanced">Advanced</el-tab-link>
    <el-tab-link for="disabled" disabled>Disabled</el-tab-link>

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
| `for` | `string \| undefined` | `undefined` | Name of the panel this link activates (matches an `<el-tab-panel>`'s `name`). |
| `disabled` | `boolean` | `false` | When present, the link does not dispatch `tab-select` on click. |

#### Methods

_None_

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `tab-select` | `{ selected: string }` | Fired on click. `detail.selected` is the `for` value, used by `<el-tab-group>` to activate the matching panel. Bubbles and crosses shadow boundaries. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-accent`, `--el-color-fg`, `--el-border-width`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

#### CSS States

| Name | Description |
| --- | --- |
| `active` | Set by the parent `<el-tab-group>` while this link's panel is the selected one. Style with `el-tab-link:state(active) { … }`. |

#### Slots

| Name        | Description            |
| ----------- | ---------------------- |
| _(default)_ | The tab label content. |

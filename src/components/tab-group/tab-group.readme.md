# TabGroup

`tab-group` is a container that pairs `<el-tab-link>` children with `<el-tab-panel>` children and shows one panel at a time. It listens for `tab-select` events bubbled from `<el-tab-link>` and mirrors the active selection onto the `selected` attribute (reflected). When no tab is selected declaratively, the first panel is shown.

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
| `selected` | `string \| undefined` | `undefined` | Name of the currently selected tab. Matches an `<el-tab-panel>`'s `name`. Reflected to the `selected` attribute. |
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

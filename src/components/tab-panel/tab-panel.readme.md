# TabPanel

`tab-panel` contains the content associated with a tab. It is paired with an `<el-tab-link>` by `name`, and its visibility is driven by the parent `<el-tab-group>`, which toggles `display: block / none` based on the active selection.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tab-panel/define';
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
| `name` | `string \| undefined` | `undefined` | Identifier matched by an `<el-tab-link for="…">` to activate this panel. |

#### Methods

_None_

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

| Name        | Description          |
| ----------- | -------------------- |
| _(default)_ | The panel's content. |

# AccordionGroup

`accordion-group` is a container component that manages multiple accordion elements. It can control whether multiple accordions can be open simultaneously or enforce single-accordion-open behavior (only one accordion open at a time).

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/accordion-group/define';
```

```html
<!-- Allow only one accordion open at a time -->
<el-accordion-group show-multiple="false">
    <el-accordion>
        <div slot="header">First Accordion</div>
        <div slot="content">First content...</div>
    </el-accordion>

    <el-accordion>
        <div slot="header">Second Accordion</div>
        <div slot="content">Second content...</div>
    </el-accordion>
</el-accordion-group>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `showMultiple` | `boolean` | `true` | When set to `false`, only one accordion element can be open at a time. Opening a new accordion will automatically close the previously open one. When `true`, multiple accordions can be open simultaneously. |

#### Methods

_None_

#### Events

_None_ (listens to `AccordionToggle` events from child accordion elements)

#### CSS Custom Properties

_None_

#### Slots

_None_ (uses default slot for accordion children)

# TransitionClasses

`transition-classes` applies transition classes to the host element across `enter` / `enter-start` / `enter-end` and `leave` / `leave-start` / `leave-end` stages, driven by the `show` property. Each stage is read from a same-named attribute on the host. It pairs well with utility-class frameworks (e.g. Tailwind) to animate elements in and out.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/transition-classes/define';
```

```html
<el-transition-classes
    show="true"
    enter="transition duration-300"
    enter-start="opacity-0"
    enter-end="opacity-100"
    leave="transition duration-200"
    leave-start="opacity-100"
    leave-end="opacity-0"
>
    <div>I fade in and out</div>
</el-transition-classes>
```

## API

#### Properties/Attributes

| Name   | Type      | Default | Description                                                                         |
| ------ | --------- | ------- | ----------------------------------------------------------------------------------- |
| `show` | `boolean` | `false` | When `true` the host plays the enter transition; when `false` the leave transition. |

The following attributes are read directly from the host (not properties) to determine the classes applied at each transition stage:

| Attribute     | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `enter`       | Space-separated classes added throughout the enter transition. |
| `enter-start` | Classes applied at the start of the enter transition.          |
| `enter-end`   | Classes applied at the end of the enter transition.            |
| `leave`       | Space-separated classes added throughout the leave transition. |
| `leave-start` | Classes applied at the start of the leave transition.          |
| `leave-end`   | Classes applied at the end of the leave transition.            |

#### Methods

| Name     | Parameters | Description                                                       |
| -------- | ---------- | ----------------------------------------------------------------- |
| `show()` | None       | Play the enter transition (equivalent to setting `show = true`).  |
| `hide()` | None       | Play the leave transition (equivalent to setting `show = false`). |

#### Events

_None_

#### CSS Custom Properties

_None_

#### Slots

| Name        | Description                        |
| ----------- | ---------------------------------- |
| _(default)_ | The element(s) being transitioned. |

# Accordion

`accordion` is a collapsible content component that expands and collapses content sections with smooth animations. It features customizable header and content slots, automatic toggle functionality, and emits events when its state changes.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/accordion/define';
```

```html
<el-accordion open="false">
    <div slot="header">Accordion Header</div>
    <div slot="content">Your content goes here...</div>
</el-accordion>
```

## API

#### Properties/Attribute

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Controls whether the accordion is expanded (true) or collapsed (false). This property is reflected to the element's attribute. |

#### Methods

| Name         | Parameters | Description                                           |
| ------------ | ---------- | ----------------------------------------------------- |
| `toggle()`   | None       | Toggles the accordion between open and closed states. |
| `expand()`   | None       | Opens the accordion with animation.                   |
| `collapse()` | None       | Closes the accordion with animation.                  |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `AccordionToggle` | `{ open: boolean }` | Fired when the accordion is toggled. The event bubbles up through the DOM. The detail contains the current open state. |

#### CSS Parts

| Name      | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `title`   | The clickable header row (wraps the `header` slot and the chevron icon). |
| `content` | The collapsible content region.                                          |
| `icon`    | The chevron icon; rotates 180° while the accordion is open.              |

#### CSS States

| Name | Description |
| --- | --- |
| `open` | Present on the host while the accordion is expanded. Style with `el-accordion:state(open)` or `:host(:state(open))`. |

#### CSS Custom Properties

This component is headless by default and reads the library's `--el-*` design tokens (e.g. `--el-color-bg`, `--el-color-border`, `--el-radius-md`, `--el-space-3`, `--el-duration-md`). Skin it by setting these via a theme — see the Storybook _Docs / Theming_ page.

#### Slots

| Name      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| `header`  | Content to display in the accordion header/title area. Clicking this area toggles the accordion. |
| `content` | Content to display in the collapsible section of the accordion.                                  |

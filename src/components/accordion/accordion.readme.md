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
| `open` | `boolean` | `false` | Controls whether the accordion is expanded (true) or collapsed (false). This property is reflected to the element's attribute, and the stylesheet of the element reads that attribute: without `open="true"` the content is collapsed, before the element starts as well. |

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

On a touch screen (`@media (any-pointer: coarse)`) the header is at least `--el-touch-target` high. Without that token, and on a fine pointer, the sizes stay as they are.

#### Slots

| Name      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| `header`  | Content to display in the accordion header/title area. Clicking this area toggles the accordion. |
| `content` | Content to display in the collapsible section of the accordion.                                  |

## Server-side rendering

An accordion that is rendered on the server (as Declarative Shadow DOM, for example with [`@webtides/element-js-ssr-renderer`](https://github.com/webtides/element-js-ssr-renderer)) is painted the way it will be once the element runs:

- Without `open`, or with `open="false"`, it shows its header alone. The stylesheet of the element collapses the content unless the host has `open="true"`, and the attribute of the host is in the markup of the server.
- With `open="true"` it is open, with the line under its header and the turned chevron.

Nothing is painted that goes away again, and nothing below the accordion moves when the element takes over. The same holds for an accordion that is rendered in the browser: a closed one starts closed, it is not collapsed in front of the user.

Write `open="true"`, not a bare `open`: element-js reads a bare attribute as not set.

## Where scripting is off

- A server-rendered accordion stays as it was rendered. A closed one shows its header, and the header does nothing: its content cannot be reached. An open one stays open and cannot be closed.
- An accordion that is not server-rendered has no shadow root there. The browser shows what the page wrote, the header and the content one below the other.

A page that wants the content of its server-rendered accordions to be readable without scripting opens them itself. A rule of the page for the `content` part wins over the rule of the element:

```css
@media (scripting: none) {
    el-accordion::part(content) {
        height: auto;
    }
}
```

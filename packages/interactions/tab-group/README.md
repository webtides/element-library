# TabGroup

A `tab-group` wraps a list of tab-links and tab-panels and shows one at a time

## How to use

### Installation

```sh
npm install @webtides/tab-group
```

```js
import('@webtides/tab-group').then(({ define }) => define());
```

### Example

```html
<tab-group selected="general">
    <tab-link for="general">General</tab-link>
    <tab-link for="custom">Custom</tab-link>
    <tab-link for="advanced">Advanced</tab-link>
    <tab-link for="disabled" disabled>Disabled</tab-link>

    <tab-panel name="general">This is the general tab panel.</tab-panel>
    <tab-panel name="custom">This is the custom tab panel.</tab-panel>
    <tab-panel name="advanced">This is the advanced tab panel.</tab-panel>
    <tab-panel name="disabled">This is a disabled tab panel.</tab-panel>
</tab-group>
```

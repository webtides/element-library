```js script
import '../scroll-to.js';

export default {
  title: 'Elements/ScrollTo',
  parameters: { component: 'scroll-to' } },
};
```

# ScrollTo

A component meant to display small information with additional data on the back.
// [...] use markdown to format your text
// the following demo is inline

```js story
export const Simple = () => html`
  <scroll-to>Hello World</scroll-to>
`;
```

## Variations

Show demo with a frame and a "show code" button.

```js preview-story
export const Simple = () => html`
  <scroll-to>Hello World</scroll-to>
`;
```

## API

The api table will show the data of "scroll-to" in your `custom-elements.json`.

<sb-props of="scroll-to"></sb-props>

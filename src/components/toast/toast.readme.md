# Toast

`toast` is the region of a page where toasts appear: short messages about something that has just happened, which come by themselves and leave by themselves. A toast is an [`el-notification`](../notification/notification.readme.md). The region gives it its place at an edge of the viewport, puts several of them into a stack and lets no more than `max` of them show at once; the rest wait for their turn.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

With the function, which needs no element in the page:

```js
import { toast } from '@webtides/element-library/toast';

toast('Your changes are saved.', { variant: 'success' });
```

Or with a region of your own, for a place and a limit:

```js
import '@webtides/element-library/toast/define';
```

```html
<el-toast placement="bottom" max="3"></el-toast>
```

```js
document.querySelector('el-toast').toast('Your changes are saved.', { variant: 'success' });
```

The function uses the first `el-toast` of the document. A page without one gets one at the end of its body, with the defaults.

## API

#### Properties/Attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `string` | `'top-end'` | `top-start`, `top`, `top-end`, `bottom-start`, `bottom` or `bottom-end`: the edge of the viewport the toasts appear at, and the corner. Reflected. |
| `max` | `number` | `Infinity` | How many toasts show at once. The ones beyond that wait until a place is free. |
| `label` | `string` | `'Notifications'` | The name of the landmark. |

#### Methods

| Name                       | Returns       | Description                                                   |
| -------------------------- | ------------- | ------------------------------------------------------------- |
| `toast(message, options?)` | `HTMLElement` | Shows a message as a toast and returns its `el-notification`. |

The module exports a function of the same name and with the same arguments: `import { toast } from '@webtides/element-library/toast'`.

| Argument | Type | Description |
| --- | --- | --- |
| `message` | `string \| Node` | A text, a node for a message with markup, or an `el-notification` that is shown as it is. |
| `options.variant` | `string` | The variant of the notification: `default`, `primary`, `success`, `neutral`, `warning` or `danger`. |
| `options.duration` | `number` | How long the toast stays, in milliseconds. `Infinity` keeps it until it is closed. Default `5000` for a text or a node. |
| `options.closable` | `boolean` | Whether the toast has a close button. Default `true` for a text or a node. |
| `options.closeLabel` | `string` | The accessible label of the close button. |

#### Events

_None of its own._ A toast fires the events of a notification (`notification-show`, `notification-after-show`, `notification-hide`, `notification-after-hide`), which bubble through the region.

#### Slots

| Name        | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| _(default)_ | The toasts, `el-notification` elements. `toast()` puts them here. |

#### CSS Parts

| Name   | Description                                                           |
| ------ | --------------------------------------------------------------------- |
| `base` | The stack of the toasts. It is the landmark with the name in `label`. |

#### CSS Custom Properties

| Name               | Description                                                                            |
| ------------------ | -------------------------------------------------------------------------------------- |
| `--el-toast-inset` | The distance of the stack from the edges of the viewport. Unset, it is `--el-space-4`. |

Reads the standard library design tokens `--el-space-4` and `--el-space-2` (the gap between two toasts). The look of a toast is the look of `el-notification`.

## A toast

`toast()` takes a text, or a node for a message with markup, and makes a notification of it that can be closed and leaves by itself after five seconds. The options change that:

```js
// Stays until it is closed
toast('The connection is lost.', { variant: 'danger', duration: Infinity });

// With markup
const message = document.createElement('span');
message.innerHTML = 'Moved to <strong>Archive</strong>.';
toast(message);
```

Never put text from a user into `innerHTML`. A text that is passed as a string is shown as text.

An `el-notification` is shown as it is, with its own variant, icon and duration; options are set on top of it:

```js
const note = document.createElement('el-notification');
note.variant = 'primary';
note.innerHTML = '<svg slot="icon" …></svg>You have a new message.';
toast(note, { duration: 8000 });
```

`toast()` returns the notification. `hide()` on it takes the toast away early, and it fires the events of a notification:

```js
const saving = toast('Saving …', { duration: Infinity, closable: false });
await save();
saving.hide();
```

A toast that has left is taken out of the page. The countdown of a toast stops while the pointer or the focus is on it, as that of every notification does.

## Places and the stack

| `placement`    | Where the toasts appear                 |
| -------------- | --------------------------------------- |
| `top-start`    | At the top, at the start of the line    |
| `top`          | At the top, in the middle               |
| `top-end`      | At the top, at the end. The default.    |
| `bottom-start` | At the bottom, at the start of the line |
| `bottom`       | At the bottom, in the middle            |
| `bottom-end`   | At the bottom, at the end               |

Start and end follow the reading direction: in a text that runs from right to left the start is at the right.

The first toast is at the edge, the next ones follow towards the middle of the viewport. The stack keeps a distance of `--el-toast-inset` from the edges and is never wider than the viewport between these distances: on a phone a toast is as wide as the screen allows and its text wraps.

The region lets the pointer through: what is beside and between the toasts can be clicked.

## More toasts than places

With `max` the region shows no more than that many toasts at once. A toast beyond that waits, in the order the toasts came, and is shown when a place is free: when a toast before it is gone, not when it starts to leave.

A toast that stays until it is closed (`duration: Infinity`) and cannot be closed keeps its place until a script hides it. With a limit, the toasts behind it wait that long.

Without `max` there is no limit, and a `max` that is no number of at least 1 counts as none.

## The top layer

While it has toasts the element is a native popover of the platform (`popover="manual"`), which owns the top layer: nothing of the page lies on top of a toast, whatever `z-index` it has. Without toasts the region is not shown.

The top layer is a stack: what is opened later lies above. Every new toast brings the region to the front, so a toast lies above a dialog or a popover that was opened before it. What is opened afterwards lies above the toasts that are shown, until the next one comes.

**In a modal dialog.** An open modal dialog makes the rest of the page inert, a region outside of the dialog included: its toasts can be seen but not clicked, and assistive technology does not reach them. A dialog that shows toasts while it is open has a region of its own inside:

```html
<el-dialog label="Settings">
    …
    <el-toast placement="bottom"></el-toast>
</el-dialog>
```

```js
dialog.querySelector('el-toast').toast('Saved.', { variant: 'success' });
```

## Toasts in the markup

A notification that the page puts into the region itself is a toast like any other: the region shows itself for it, counts it as a place that is taken and takes it out of the page when it has left.

```html
<el-toast>
    <el-notification open="true" variant="success" closable="true">Welcome back.</el-notification>
</el-toast>
```

## Accessibility

- The stack is a landmark (`role="region"`) with the name in `label`, by which a screen reader finds the toasts. It is there only while there are toasts.
- Every toast is a notification and with that a live region of its own: `role="alert"` for `danger` and `warning`, `role="status"` for the others. The region adds no second live region around them.
- A toast does not take the focus. Its close button is reached with `Tab`, where the region stands in the page: at the end for a region that `toast()` has added.
- A message that leaves by itself must not be the only place where something is said. Give an error that needs an answer `duration: Infinity`, or show it where the error is.
- The names are English by default. For another language set `label` on the region and `closeLabel` in the options.
- There is no `variant` and no `size` on the region: the variant belongs to the toast.

## Server-side rendering

The region is part of the server-rendered markup (Declarative Shadow DOM), and so is a notification in it: before the JavaScript has arrived it is shown in its place, as a fixed box. With the element it goes into the top layer, in the same place.

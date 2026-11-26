# Tree

`tree` shows entries that open and close: folders, categories, the library beside the content. The tree is a list; every [`el-tree-item`](../tree-item/tree-item.readme.md) in it is an entry, and an entry holds the entries below it. An entry is a link, and one with entries below it has a button that opens and closes them.

## How to use

#### Install

```sh
npm i --save @webtides/element-library
```

#### Use

```js
import '@webtides/element-library/tree/define';
import '@webtides/element-library/tree-item/define';
```

```html
<el-tree label="Folders">
    <el-tree-item label="Inbox" href="/inbox" open="true">
        <span slot="end">12</span>
        <el-tree-item label="Work" href="/inbox/work" current="true"></el-tree-item>
        <el-tree-item label="Private" href="/inbox/private"></el-tree-item>
    </el-tree-item>
    <el-tree-item label="Drafts" href="/drafts"></el-tree-item>
</el-tree>
```

> Boolean attributes are passed as strings (`open="true"`), matching the rest of the library.

## API

#### Properties/Attributes

| Name    | Type     | Default | Description                                                              |
| ------- | -------- | ------- | ------------------------------------------------------------------------ |
| `label` | `string` | `''`    | The name of the tree for assistive technology. Unset, the tree has none. |

#### Methods

_None._

#### Events

_None of its own. `tree-item-toggle` of an entry bubbles through the tree: listen for it there to keep the open branches._

#### Slots

| Name      | Description                                              |
| --------- | -------------------------------------------------------- |
| (default) | The entries of the first level: `el-tree-item` elements. |

#### CSS Parts

| Name   | Description                                  |
| ------ | -------------------------------------------- |
| `base` | The list of the first level (`role="list"`). |

#### CSS Custom Properties

| Name | Default | Description |
| --- | --- | --- |
| `--el-tree-indent` | `--el-space-4` | How far the entries of a level stand in from the ones of the level above. Read by the entries, so it can be set on the tree or for the page. Without a theme it is `1rem`. |

## Open branches

Which branches are open is said by the `open` attribute of the entries, and by nothing else: the tree keeps no state of its own. So the page can render it, on a server as well, and keep it:

```js
tree.addEventListener('tree-item-toggle', (event) => {
    // The entry itself, not one further up: the event bubbles.
    remember(event.target.id, event.detail.open);
});
```

A branch that holds the current entry is not opened by the tree. Render `open="true"` on the entries above the current one.

## What it is, and what it is not

To assistive technology the tree is what its markup says: a list of links, with a list below each entry that has entries, and a button per branch that says whether the branch is open (`aria-expanded`). It has no `role="tree"`.

That is a decision. `role="tree"` makes a widget of the list: a screen reader stops reading it as links, and its user has to know the keys of a tree and has nothing before the script has run. The WAI-ARIA Authoring Practices advise against it for a navigation. As nested lists the entries stay links: they are in the list of links of a screen reader, they say "current page" and "visited", and they work without JavaScript.

What the tree takes from the tree view pattern is its keyboard, on top of the Tab key.

## Keyboard

Every link and every button of a branch is a stop of the Tab key, as on any page. With the focus on an entry, the script adds the keys of the WAI-ARIA tree view pattern:

| Key | What it does |
| --- | --- |
| Down arrow, up arrow | Moves the focus to the next and the previous entry that is shown. It stops at the ends. |
| Right arrow | Opens a closed branch. On an open one, moves the focus to its first entry. |
| Left arrow | Closes an open branch. On a closed one, or an entry without entries below, moves the focus to the entry above. |
| Home, End | Moves the focus to the first and the last entry that is shown. |
| Enter | Follows the link, as on any link. |

In a text that runs from right to left, the left arrow opens and goes in, and the right arrow closes and goes out.

## Accessibility

- The tree has `role="list"`, every entry `role="listitem"`, and the entries below an entry are a list of their own: a screen reader says how many entries a level has.
- `label` names the tree. A tree that is the navigation of a page belongs into a `<nav>` of the page, which carries the name then.
- The entry of the page the user is on has `aria-current="page"`, see [`el-tree-item`](../tree-item/tree-item.readme.md#the-current-entry).
- The button of a branch is named by the name of its entry and says whether the branch is open.
- On a touch screen (`@media (any-pointer: coarse)`) a row is at least `--el-touch-target` high, and the button of a branch is that wide and high.

## Server-side rendering

The lists, the links, the buttons and the open branches are part of the server-rendered markup (Declarative Shadow DOM): the stylesheet of an entry reads its `open` attribute. A server-rendered tree shows its open branches before the elements take over and looks the same after, and its links work without JavaScript. The script adds the opening and closing and the arrow keys.

The `hidden` attribute hides the tree, and an entry.

## What it does not do

- No moving of entries by dragging, no renaming in place, no checkbox per entry.
- No loading of the entries below when a branch opens: the entries are in the page.

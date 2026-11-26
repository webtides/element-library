import hostStyle from '../../styles/host.style.js';
import { sizeContextStyle } from '../../styles/size.style.js';
import { appearanceContextStyle } from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /* A row with a gap, which breaks into a second line where its controls do not fit: every
       control stays in reach, and the toolbar is never wider than its place. The gaps follow the
       reading direction, as the order of the controls does. */
    .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        min-width: 0;
    }

    /* The group at the end: all the room that is left is in front of it. In a line of its own it
       still stands at the end. */
    .end {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--el-space-2, 0.5rem);
        margin-inline-start: auto;
    }

    /* The tooltips of the buttons with an icon alone take no room. A tooltip hides itself while
       it is closed, but with a stylesheet it only has once it has rendered: for a frame its text
       would be a line under the toolbar. */
    el-tooltip:not(:popover-open) {
        display: none;
    }

    /* A divider between two groups is as high as a control, not as the whole row of a toolbar
       that has broken into lines. */
    ::slotted(el-divider) {
        align-self: center;
        height: 1.5em;
    }
`;

// Plain is the appearance of a toolbar that names none.
export default [hostStyle(), sizeContextStyle(), appearanceContextStyle(':host', 'plain'), style].join('\n');

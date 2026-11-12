import modalStyle from '../../styles/modal.style.js';

const css = String.raw;

const border = 'var(--el-border-width, 0)';

/*
 * What is the drawer's own: a box along one edge of the viewport, which slides in from that edge.
 * The paint of the surface, the backdrop and the parts are in the modal module.
 *
 * The first rule is the drawer at the end of the line, which is also what a placement that is none
 * of the four gets. The other placements change what differs.
 */
const style = css`
    dialog {
        /* The direction the end of a line is in: 1 for the right, -1 for the left. */
        --_el-drawer-end: 1;
        /* How far the drawer is out of the viewport before it is shown. */
        --_el-drawer-x: calc(100% * var(--_el-drawer-end));
        --_el-drawer-y: 0;

        box-sizing: border-box;
        /* The browser centres a modal dialog and keeps it smaller than the viewport. Here it lies
           against three edges, and the fourth is free. */
        inset: 0;
        inset-inline-start: auto;
        /* Not in the middle either, when a page makes it shorter than the viewport. */
        margin: 0;
        max-inline-size: 100%;
        max-block-size: 100%;
        inline-size: var(--el-drawer-size, 25rem);
        /* From edge to edge: the browser gives a dialog the height of its content. */
        block-size: auto;

        /* A border on the edge that faces the page only. */
        border: 0 solid var(--el-color-border, transparent);
        border-inline-start-width: ${border};

        transform: translate(var(--_el-drawer-x), var(--_el-drawer-y));
        /* A close that is refused makes the dialog a little larger for a moment. The drawer grows
           away from its edge. */
        transform-origin: calc(50% + 50% * var(--_el-drawer-end)) 50%;
    }

    /* Asked of the host. With \`dir\` on an element around the drawer, Chromium does not match
       \`:dir(rtl)\` for an element inside the shadow root. */
    :host(:dir(rtl)) dialog {
        --_el-drawer-end: -1;
    }

    :host([placement='start']) dialog {
        --_el-drawer-x: calc(-100% * var(--_el-drawer-end));
        inset-inline: 0 auto;
        border-inline-width: 0 ${border};
        transform-origin: calc(50% - 50% * var(--_el-drawer-end)) 50%;
    }

    /* Across the viewport, and as high as the content unless a size is given. */
    :host([placement='top']) dialog,
    :host([placement='bottom']) dialog {
        --_el-drawer-x: 0;
        inset-inline: 0;
        inline-size: auto;
        block-size: var(--el-drawer-size, auto);
        border-inline-width: 0;
    }

    :host([placement='top']) dialog {
        --_el-drawer-y: -100%;
        inset-block-end: auto;
        border-block-end-width: ${border};
        transform-origin: 50% 0;
    }

    :host([placement='bottom']) dialog {
        --_el-drawer-y: 100%;
        inset-block-start: auto;
        border-block-start-width: ${border};
        transform-origin: 50% 100%;
    }
`;

export default [modalStyle(), style].join('\n');

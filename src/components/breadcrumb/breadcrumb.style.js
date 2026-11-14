import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /* A row that breaks into a second one where it does not fit. An item brings its separator
       with it, so the gap is the space on both sides of a separator. */
    .list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--el-space-1, 0.25em) var(--el-space-2, 0.5em);
    }
`;

export default [hostStyle(), style].join('\n');

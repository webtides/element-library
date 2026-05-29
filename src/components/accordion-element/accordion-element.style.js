const css = String.raw;

export default css`
    :host {
        &[cloak='true'] {
            svg {
                display: none;
            }
        }
    }

    [part~='title'] {
        display: flex;
        padding: var(--el-space-3, 0) 0;
        cursor: pointer;
        border-bottom: var(--el-border-width, 0) solid var(--el-color-border, transparent);
    }

    .icon {
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        margin-left: auto;
        width: 1.25em;
        height: 1.25em;
        transition: transform var(--el-duration-md, 0.3s) var(--el-ease, ease-out);
    }

    .icon svg {
        width: 100%;
        height: 100%;
    }

    :host([cloak]) {
        display: none;
    }

    :host(:state(open)) .icon {
        transform: rotate(180deg);
    }

    .content {
        overflow: hidden;
        transition: height var(--el-duration-md, 0.3s) var(--el-ease, ease-out);
        height: auto;
    }

    /* Padding lives on the inner wrapper so collapsing .content to height:0 clips it too. */
    .content-inner {
        padding: var(--el-space-3, 0) 0;
    }
`;

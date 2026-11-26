import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    .tree {
        font-family: var(--el-font-family, inherit);
        line-height: var(--el-line-height, inherit);
    }
`;

export default [hostStyle(), style].join('\n');

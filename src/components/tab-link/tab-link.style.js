const css = String.raw;

export default css`
    el-tab-link {
        display: inline-block;

        &:hover {
            cursor: pointer;
        }

        &[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
`;

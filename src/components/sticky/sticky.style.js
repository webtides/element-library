const css = String.raw;

export default css`
    el-sticky {
        position: sticky;
        display: block;
        transition: transform var(--el-duration-md, 0.3s) var(--el-ease, ease);

        --sticky-height: 100%;

        &:state(sticky) {
            &:state(up):not([force-down]) {
                transform: translateY(-100%);
            }

            &:state(down) {
                transform: translateY(calc(-100% + var(--sticky-height)));
            }
        }
    }
`;

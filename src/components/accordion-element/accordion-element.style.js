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
    }

    .open-icon,
    .close-icon {
        justify-content: center;
        align-items: center;
        margin-left: auto;
        width: 8.33%;
    }

    .open-icon {
        display: flex;
    }

    .close-icon {
        display: none;
    }

    :host([cloak]) {
        display: none;
    }

    :host(:state(open)) {
        .open-icon {
            display: none;
        }

        .close-icon {
            display: flex;
        }
    }

    .content {
        overflow: hidden;
        transition: height var(--el-duration-md, 0.3s) var(--el-ease, ease-out);
        height: auto;
    }
`;

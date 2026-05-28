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

    :host([open='true']) {
        .open-icon {
            display: none;
        }

        .close-icon {
            display: flex;
        }
    }

    .content {
        overflow: hidden;
        transition: height 0.3s ease-out;
        height: auto;
    }
`;

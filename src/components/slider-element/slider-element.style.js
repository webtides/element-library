const css = String.raw;

export default css`
    :host {
        display: block;
        position: relative;
    }

    ol,
    ul,
    li {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .scroller {
        display: flex;
        overflow-x: scroll;
        position: relative;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        counter-reset: item;
        scroll-snap-type: x mandatory;
    }

    .scroller::-webkit-scrollbar {
        display: none;
    }

    ::slotted(.item) {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        scroll-snap-align: var(--snap-align, center);
        width: var(--item-width, 100%);
    }

    [part~='dots'] {
        display: flex;
        position: relative;
        justify-content: center;

        [part~='dot'] {
            cursor: pointer;
            background: none;
            border: none;
            color: var(--el-color-fg, currentColor);
            padding: var(--el-space-1, 4px);
            font-size: 18px;
        }

        [part~='dot']::after {
            content: '○';
            padding: var(--el-space-1, 4px);
        }

        [part~='dot']:hover {
            color: #666;
        }

        [part~='dot']:active {
            color: #999;
        }

        [part~='dot'][aria-pressed='true']::after {
            content: '●';
        }
    }

    [part~='arrows'] {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        pointer-events: none;

        [part~='arrow'] {
            pointer-events: all;
            padding: var(--el-space-1, 4px);
            font-size: 18px;

            button {
                cursor: pointer;
                background: var(--el-color-bg, transparent);
                color: var(--el-color-fg, inherit);
                border-radius: var(--el-radius-md, 0);
                border: none;
                padding: var(--el-space-2, 8px) var(--el-space-4, 16px);
            }
        }

        [part~='arrow-left'] {
            left: 0;
        }

        [part~='arrow-right'] {
            right: 0;
        }
    }
`;

const css = String.raw;

export default css`
    el-select-field {
        display: block;

        /*
         * The field renders a chevron of its own, hidden by default: the native <select> of the
         * browser already paints one, and showing both would duplicate. styles/native.css takes
         * the native one away and sets this property, so a decorated select has a single chevron
         * that follows the tokens. A property, not a rule there: a rule would have the same
         * weight as this one, and the later of the two would win.
         */
        .dropdown-indicator {
            display: var(--_el-select-indicator-display, none);
        }

        .dropdown-indicator svg {
            display: block;
            width: 1em;
            height: 1em;
        }

        /* The error message has the danger colour of the theme, as in every field. Without a theme
           it has the colour of the text, which can be read on any background. */
        .error-message {
            color: var(--el-color-danger, inherit);
        }

        /* Touch screens: the control is at least --el-touch-target high. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            select {
                min-height: max(var(--el-control-height, 0px), var(--el-touch-target, 0px));
            }
        }
    }
`;

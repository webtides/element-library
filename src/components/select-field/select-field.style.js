const css = String.raw;

export default css`
    el-select-field {
        display: block;

        /*
         * Hide the custom .dropdown-indicator by default — the unthemed native
         * <select> already paints its own chevron, so showing both would
         * duplicate. Themes (default.css, high-contrast.css) un-hide and
         * position the custom indicator, AND suppress the native chevron via
         * appearance: none, so the result is a single, theme-able glyph.
         */
        .dropdown-indicator {
            display: none;
        }

        .dropdown-indicator svg {
            display: block;
            width: 1em;
            height: 1em;
        }
    }
`;

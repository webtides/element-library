const css = String.raw;

export default css`
    el-checkbox-field {
        display: block;

        .field > label {
            display: inline-flex;
            align-items: center;
            gap: var(--el-space-2, 0.5em);
            cursor: pointer;
        }

        /* The native checkbox is replaced by .checked-indicator; hide it visually but keep it
           in the accessibility tree and focusable. */
        input[type='checkbox'] {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: 0;
            padding: 0;
            border: 0;
            opacity: 0;
            overflow: hidden;
            white-space: nowrap;
            clip: rect(0 0 0 0);
            clip-path: inset(50%);
        }

        /* Reflect keyboard focus onto the custom indicator. */
        input[type='checkbox']:focus-visible + .checked-indicator {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
            outline-offset: 2px;
        }

        .checked-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: none;
            /* Fallbacks render a usable box even without a theme, since the native input is hidden. */
            width: var(--el-space-4, 1em);
            height: var(--el-space-4, 1em);
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            border-radius: var(--el-radius-sm, 0);
            background: var(--el-color-bg, transparent);
            transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        /* Hide the checkmark glyph via opacity (not color: transparent) so the indicator's
           currentColor border stays visible while unchecked. */
        .checked-indicator > .checked {
            opacity: 0;
            line-height: 1;
        }

        &:state(checked) .checked-indicator {
            background: var(--el-color-accent, currentColor);
            border-color: var(--el-color-accent, currentColor);
        }

        /* Checkmark contrasts against the filled box. Set on the glyph (not the indicator) so
           the indicator's currentColor-based fill above keeps resolving to the text color. */
        &:state(checked) .checked-indicator > .checked {
            opacity: 1;
            color: var(--el-color-bg, Canvas);
        }
    }
`;

const css = String.raw;

export default css`
    el-switch-field {
        display: block;

        .field > label {
            display: inline-flex;
            align-items: center;
            gap: var(--el-space-2, 0.5em);
            cursor: pointer;
        }

        .field > label:has(input:disabled) {
            cursor: not-allowed;
        }

        /* The native checkbox is replaced by the track/thumb; hide it visually but keep it in the
           accessibility tree and focusable. */
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

        /* Reflect keyboard focus onto the custom track. */
        input[type='checkbox']:focus-visible + .switch-track {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-accent, currentColor);
            outline-offset: 2px;
        }

        .switch-track {
            position: relative;
            display: inline-block;
            flex: none;
            box-sizing: border-box;
            /* Track is sized in em so it scales with the surrounding font-size. */
            width: 2.4em;
            height: 1.4em;
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            border-radius: 999px;
            background: var(--el-color-bg, transparent);
            transition:
                background var(--el-duration-md, 0s) var(--el-ease, linear),
                border-color var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        .switch-thumb {
            position: absolute;
            top: 50%;
            left: 0.15em;
            width: 1.1em;
            height: 1.1em;
            border-radius: 50%;
            /* Visible against the headless (transparent) track via currentColor. */
            background: var(--el-color-border, currentColor);
            transform: translateY(-50%);
            transition:
                transform var(--el-duration-md, 0s) var(--el-ease, linear),
                background var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        input[type='checkbox']:checked + .switch-track {
            background: var(--el-color-accent, currentColor);
            border-color: var(--el-color-accent, currentColor);
        }

        /* Slide the thumb to the right edge and flip it to the surface color so it reads on the fill. */
        input[type='checkbox']:checked + .switch-track .switch-thumb {
            transform: translate(calc(2.4em - 1.1em - 0.3em), -50%);
            background: var(--el-color-bg, Canvas);
        }

        input[type='checkbox']:disabled + .switch-track {
            opacity: 0.5;
        }

        .message {
            display: block;
        }

        .help-message {
            color: var(--el-color-fg-muted, inherit);
        }

        .error-message {
            color: var(--el-color-danger, inherit);
        }
    }
`;

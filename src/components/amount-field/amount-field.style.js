import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';

const css = String.raw;

const style = css`
    el-amount-field {
        .stepper {
            display: flex;
            flex-direction: row;
            align-items: center;
            border: var(--el-border-width, 0) solid var(--el-color-border, transparent);
            border-radius: var(--el-radius-md, 0);
            overflow: hidden;
            width: fit-content;
            /* As wide as its content in the row of the field as well, where it would shrink. */
            flex: none;
        }

        .step {
            cursor: pointer;
            background: var(--el-color-bg-muted, transparent);
            color: var(--el-color-fg, inherit);
            border: 0;
            padding: var(--el-space-2, 0) var(--el-space-3, 0);
            min-height: var(--el-touch-target, auto);
            font: inherit;
        }

        /* The stepper cuts off what is outside of it, a ring around one of its parts as well. So the
           part that has the keyboard focus shows it inside of itself. */
        .step:focus-visible,
        input:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
        }

        /* The ring of a button follows the inner corners of the stepper, on the side where the button
           meets them. With the ring only: at rest the stepper cuts the corners of its buttons, and
           they have none of their own. A radius of the theme that is not one length leaves the ring
           square. */
        .plus:focus-visible {
            border-start-start-radius: max(0px, var(--el-radius-md, 0px) - var(--el-border-width, 0px));
            border-end-start-radius: max(0px, var(--el-radius-md, 0px) - var(--el-border-width, 0px));
        }

        .minus:focus-visible {
            border-start-end-radius: max(0px, var(--el-radius-md, 0px) - var(--el-border-width, 0px));
            border-end-end-radius: max(0px, var(--el-radius-md, 0px) - var(--el-border-width, 0px));
        }

        /* The signs are strings of the stylesheet, so a page can set its own. */
        .plus::before {
            content: var(--el-amount-field-plus, '+');
        }

        .minus::before {
            content: var(--el-amount-field-minus, '-');
        }

        .step:hover:not(:disabled) {
            background: var(--el-color-border, transparent);
        }

        .step:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        input {
            text-align: center;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: textfield;
            border: 0;
            background: var(--el-color-bg, transparent);
            color: var(--el-color-fg, inherit);
            padding: var(--el-space-2, 0) var(--el-space-3, 0);
            min-width: var(--el-touch-target, auto);
            font: inherit;
        }

        input[type='number'] {
            -moz-appearance: textfield;
        }

        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }

        /* Touch screens: the buttons are at least --el-touch-target wide as well, and the input fills
           the height of the stepper, which the buttons set. */
        @media (any-pointer: coarse) {
            .step {
                min-width: var(--el-touch-target, auto);
            }

            input {
                align-self: stretch;
            }
        }
    }
`;

export default [hostStyle('el-amount-field'), formControlStyle('el-amount-field'), style].join('\n');

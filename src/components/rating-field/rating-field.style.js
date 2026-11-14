import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import choiceGroupStyle from '../../styles/choice-group.style.js';

const css = String.raw;

/**
 * The fieldset as the column of the field, the option as the hit area of its radio and the hidden
 * native radio are the shared module `choice-group`. Here: the options beside each other, and the
 * star that is drawn in the place of a radio.
 */
const style = css`
    el-rating-field {
        /* The row is as wide as its stars and no wider: the pointer is over the row only while it
           is over a star. */
        .options {
            display: flex;
            align-self: flex-start;
        }

        /* The room between two stars belongs to the star in front of it: the row is one hit area
           without holes, and the stars under the pointer do not flicker while it moves along. */
        .option {
            justify-content: center;
            gap: 0;
            padding-inline-end: var(--el-space-1, 4px);
        }

        .option:last-child {
            padding-inline-end: 0;
        }

        /* A star that is not on is an outline, a star that is on is filled: the two differ in
           their shape, not in their colour alone. Fallbacks render usable stars without a theme. */
        .star {
            flex: none;
            width: var(--el-rating-size, var(--el-space-5, 1.5em));
            height: var(--el-rating-size, var(--el-space-5, 1.5em));
            color: var(--el-color-fg-muted, currentColor);
            fill: none;
            stroke: currentColor;
            stroke-width: 1.5;
            stroke-linejoin: round;
            transition:
                color var(--el-duration-md, 0s) var(--el-ease, linear),
                fill var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        .option.is-on .star {
            color: var(--el-rating-color, var(--el-color-accent, currentColor));
            fill: currentColor;
        }

        /* With a mouse: the stars up to the one under the pointer are shown as on before the
           click, whatever is chosen. Not while the field is disabled.

           While the pointer is over the row every star is on, and the ones after the star under
           the pointer are off again. Both rules weigh more than the rule for a chosen star above,
           and the second more than the first. */
        @media (hover: hover) {
            .options:not(.is-disabled):hover .option .star {
                color: var(--el-rating-color, var(--el-color-accent, currentColor));
                fill: currentColor;
            }

            .options:not(.is-disabled):hover .option:hover ~ .option .star {
                color: var(--el-color-fg-muted, currentColor);
                fill: none;
            }
        }
    }
`;

export default [
    hostStyle('el-rating-field'),
    formControlStyle('el-rating-field'),
    choiceGroupStyle('el-rating-field'),
    style,
].join('\n');

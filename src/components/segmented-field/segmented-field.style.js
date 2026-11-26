import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';
import formControlStyle from '../../styles/form-control.style.js';
import choiceGroupStyle from '../../styles/choice-group.style.js';

const css = String.raw;

/**
 * The fieldset as the column of the field, the option as the hit area of its radio and the hidden
 * native radio are the shared module `choice-group`. Here: the options as a row of joined buttons,
 * and the segment that is drawn in the place of a radio.
 */
const style = css`
    el-segmented-field {
        /* A row as wide as its options, and never wider than its place: the options share the
           width then, and a label that does not fit breaks into lines. */
        .options {
            display: flex;
            align-self: flex-start;
            max-width: 100%;

            /* The size of the options: the one of the field, from the size module. */
            --_el-segment-height: var(--_el-size-height);
            --_el-segment-padding-block: var(--_el-size-padding-block);
            --_el-segment-padding-inline: var(--_el-size-padding-inline);
            --_el-segment-font-size: var(--_el-size-font-size);
        }

        /* A container that gives its controls one size, a toolbar, says so in properties that are
           inherited (see sizeContextStyle()). The field reads them while the page has not set a
           size on the field itself: the template marks the row then. Outside of such a container
           they are not set, and the size is the one of the field. */
        .options--inherit-size {
            --_el-segment-height: var(--_el-context-size-height, var(--_el-size-height));
            --_el-segment-padding-block: var(--_el-context-size-padding-block, var(--_el-size-padding-block));
            --_el-segment-padding-inline: var(--_el-context-size-padding-inline, var(--_el-size-padding-inline));
            --_el-segment-font-size: var(--_el-context-size-font-size, var(--_el-size-font-size));
        }

        /* The label is the hit area. It has no gap and no room of its own: the segment fills it,
           on a touch screen up to the least size of a target as well. */
        .option {
            position: relative;
            flex: 0 1 auto;
            align-items: stretch;
            gap: 0;
            min-width: 0;
        }

        /* Touch screens: an option may share the width of a narrow row, and still is no narrower
           than a target. The shared module says the same for every option of a field; the rule
           above, for the row, would take it back. */
        @media (any-pointer: coarse) {
            .option {
                min-width: var(--el-touch-target, 0px);
            }
        }

        /* ── Segment ──────────────────────────────────────────────────────── */

        /* An outlined button of the size of the field. The fallbacks render a usable control
           without a theme: a border in the text colour of the page. */
        .segment {
            --_el-segment-radius: var(--el-radius-md, 4px);

            position: relative;
            display: flex;
            flex: 1 1 auto;
            align-items: center;
            justify-content: center;
            gap: var(--el-space-2, 0.5em);
            /* The height of the size counts from the border, as on el-button. The field renders
               into the page, where nothing has said so. */
            box-sizing: border-box;
            min-width: 0;
            min-height: var(--_el-segment-height);
            padding: var(--_el-segment-padding-block) var(--_el-segment-padding-inline);
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            color: var(--el-color-fg, inherit);
            font-family: var(--el-font-family, inherit);
            font-size: var(--_el-segment-font-size);
            font-weight: 600;
            line-height: var(--el-line-height, 1.5);
            text-align: center;
            overflow-wrap: anywhere;
            user-select: none;
            transition: background var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        /* Only the outer corners of the row are round. The properties follow the reading
           direction, so the start of the row is at the right in a text that runs from right to
           left. */
        .option:first-child .segment {
            border-start-start-radius: var(--_el-segment-radius);
            border-end-start-radius: var(--_el-segment-radius);
        }

        .option:last-child .segment {
            border-start-end-radius: var(--_el-segment-radius);
            border-end-end-radius: var(--_el-segment-radius);
        }

        /* With a neighbour in front: the border at the start lies on the border at the end of
           that neighbour, so the two share one line. */
        .option:not(:first-child) {
            margin-inline-start: calc(-1 * var(--el-border-width, 1px));
        }

        /* The option with the focus lies over its neighbours, which would cover a part of its
           focus ring otherwise. */
        .option:has(input:focus-visible) {
            z-index: 1;
        }

        /* ── States ───────────────────────────────────────────────────────── */

        /* A tint of the text colour, which shows on every background. Hover only where the
           pointer can hover: a touch screen leaves :hover on the option that was tapped last. */
        @media (hover: hover) {
            .option:hover input:not(:disabled):not(:checked) + .segment {
                background: color-mix(in srgb, currentColor 12%, transparent);
            }
        }

        .option:active input:not(:disabled):not(:checked) + .segment {
            background: color-mix(in srgb, currentColor 24%, transparent);
        }

        /* The chosen option, as a pressed el-button: a tint of the text colour and a ring inside
           of the edge. The ring is a shape and a border, so it tells the option apart without a
           colour, and forced colours keep it. It has the corners of its segment. */
        input:checked + .segment {
            background: color-mix(in srgb, currentColor 16%, transparent);
        }

        input:checked + .segment::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 0.125rem solid currentColor;
            border-radius: inherit;
            pointer-events: none;
        }

        /* Forced colours leave the ring as the only mark: it is wider there. */
        @media (forced-colors: active) {
            input:checked + .segment::before {
                border-width: 0.1875rem;
            }
        }

        /* ── A label that is not shown ────────────────────────────────────── */

        /* label-screen-reader-only gives the legend the class sr-only. The field hides it itself,
           so a field in a toolbar has a name and no label, on a page without such a class too. */
        legend.sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: 0;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }

        /* ── Icon ─────────────────────────────────────────────────────────── */

        .segment-icon {
            flex: none;
            width: 1.25em;
            height: 1.25em;
            fill: currentColor;
        }

        /* The name of an option that shows an icon: for assistive technology alone. */
        .segment-name {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }
    }
`;

export default [
    hostStyle('el-segmented-field'),
    sizeStyle('el-segmented-field'),
    formControlStyle('el-segmented-field'),
    choiceGroupStyle('el-segmented-field'),
    style,
].join('\n');

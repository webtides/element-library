import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';
import variantsStyle from '../../styles/variants.style.js';
import appearanceStyle from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        vertical-align: middle;
    }

    /* ── Base control ─────────────────────────────────────────────────────── */

    .button {
        /* The size comes from the size module, the colours from the variants and appearance
           modules. All of them carry fallbacks: an unthemed button still renders as a usable
           native-ish control rather than disappearing. */
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--el-space-2, 0.5em);
        width: 100%;
        min-height: var(--_el-size-height);
        padding: var(--_el-size-padding-block) var(--_el-size-padding-inline);
        border: var(--el-border-width, 1px) solid transparent;
        /* The radius of the shape on all four corners. A row of joined buttons (el-button-group)
           takes it away from the corners that face a neighbour, with --_el-group-radius-start
           and --_el-group-radius-end on what is slotted into it. */
        --_el-button-radius: var(--el-radius-md, 4px);
        border-start-start-radius: var(--_el-group-radius-start, var(--_el-button-radius));
        border-end-start-radius: var(--_el-group-radius-start, var(--_el-button-radius));
        border-start-end-radius: var(--_el-group-radius-end, var(--_el-button-radius));
        border-end-end-radius: var(--_el-group-radius-end, var(--_el-button-radius));
        font-family: var(--el-font-family, inherit);
        font-size: var(--_el-size-font-size);
        font-weight: 600;
        line-height: var(--el-line-height, 1.5);
        text-align: center;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition:
            background var(--el-duration-md, 0s) var(--el-ease, linear),
            border-color var(--el-duration-md, 0s) var(--el-ease, linear),
            color var(--el-duration-md, 0s) var(--el-ease, linear);
        /* Whether a theme gives the focus ring a colour: transparent with --el-color-focus-ring.
           Without the token the var() has no value and the property is invalid, so what reads it
           takes its fallback. A stylesheet cannot ask whether a property is set in another way. */
        --_el-button-ring-themed: color-mix(in srgb, var(--el-color-focus-ring) 0%, transparent);
    }

    /* display:contents promotes the slotted content to be the flex items directly, so empty
       prefix/suffix slots contribute no box (and no phantom gap) when nothing is slotted. */
    [part='label'],
    [part='prefix'],
    [part='suffix'] {
        display: contents;
    }

    /* ── States ───────────────────────────────────────────────────────────── */

    /* Hover styles only where the pointer can hover. A touch screen keeps :hover on the button
       after a tap until the next tap lands elsewhere, so there they would stay behind. */
    @media (hover: hover) {
        .button:hover {
            /* Subtle, token-free hover that works on any background fill. */
            filter: brightness(0.95);
        }
    }

    /* Pressed: one step darker than hover, and the only feedback a touch screen gets. */
    .button:active {
        filter: brightness(0.88);
    }

    /* The ring of a theme is around the control, in the colour the theme gives it. Without that
       colour the outline is there and shows nothing; where the user forces colours, the browser
       gives it one. */
    .button:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, transparent);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    /* Without a theme the ring is inside of the control, in the colour of the label. Nothing says
       which colours the page around the control has, and the label can be read on the surface of
       the control: on its fill, and on the page where it has none. As far inside of the edge as
       the ring of a theme is outside of it. A shadow and not a border: forced colours take it
       away and leave the outline. */
    .button:focus-visible::after {
        content: '';
        position: absolute;
        inset: var(--el-border-width, 1px);
        border-radius: inherit;
        box-shadow: inset 0 0 0 var(--el-focus-ring-width, 2px) var(--_el-button-ring-themed, currentColor);
        pointer-events: none;
    }

    /* Without a fill there is nothing to darken. An outlined button gets a faint tint of its
       text colour instead, a plain one an underline like a link, and the tint when pressed. */
    @media (hover: hover) {
        :host([appearance='outlined']) .button:hover {
            background: color-mix(in srgb, currentColor 12%, transparent);
            filter: none;
        }

        :host([appearance='plain']) .button:hover {
            filter: none;
            text-decoration: underline;
        }
    }

    :host([appearance='outlined']) .button:active {
        background: color-mix(in srgb, currentColor 24%, transparent);
        filter: none;
    }

    :host([appearance='plain']) .button:active {
        background: color-mix(in srgb, currentColor 12%, transparent);
        filter: none;
        text-decoration: underline;
    }

    /* ── Pressed ──────────────────────────────────────────────────────────── */

    /* A toggle button that is pressed (aria-pressed, from the toggle property or from the page)
       has a ring inside of its edge, in the colour of its label. The ring is a shape, so it tells
       the button apart in every variant and appearance, and without a colour to rely on: it is a
       border, which forced colours keep. It has the corners of the button, the joined ones of a
       group as well, and leaves the border of the button alone: the line to a neighbour stays. */
    .button[aria-pressed='true']::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 0.125rem solid currentColor;
        border-radius: inherit;
        pointer-events: none;
    }

    /* A button without a fill gets a tint of its text colour as well, one step more than under
       the pointer. A fill is not changed: the text on it would lose contrast. */
    :host([appearance='outlined']) .button[aria-pressed='true'],
    :host([appearance='plain']) .button[aria-pressed='true'] {
        background: color-mix(in srgb, currentColor 16%, transparent);
    }

    @media (hover: hover) {
        :host([appearance='outlined']) .button[aria-pressed='true']:hover,
        :host([appearance='plain']) .button[aria-pressed='true']:hover {
            background: color-mix(in srgb, currentColor 20%, transparent);
        }
    }

    :host([appearance='outlined']) .button[aria-pressed='true']:active,
    :host([appearance='plain']) .button[aria-pressed='true']:active {
        background: color-mix(in srgb, currentColor 28%, transparent);
    }

    /* Without a theme the focus ring is inside of the control as well. It moves further in, so a
       pressed button with the focus shows two rings and not one that is a little wider. */
    .button[aria-pressed='true']:focus-visible::after {
        inset: calc(var(--el-border-width, 1px) + 0.25rem);
    }

    /* Forced colours leave the ring as the only mark: it is wider there. */
    @media (forced-colors: active) {
        .button[aria-pressed='true']::before {
            border-width: 0.1875rem;
        }
    }

    /* ── Shapes ───────────────────────────────────────────────────────────── */

    .button--pill {
        --_el-button-radius: 999px;
    }

    .button--circle {
        --_el-button-radius: 50%;
        width: var(--_el-size-height);
        height: var(--_el-size-height);
        min-height: 0;
        padding: 0;
        aspect-ratio: 1;
    }

    /* ── In a group ───────────────────────────────────────────────────────── */

    /* A filled button with a neighbour in front of it draws the line between the two: its border
       at the start has the colour the group gives it (--_el-group-divider), which shows between
       two fills of one colour. Outside of a group it is the border colour of the fill, as on
       the other three sides. The rule weighs as much as the one of the appearance module for a
       filled surface and comes after it; the ones for outlined and plain weigh more, so those
       keep their border. */
    :host .button {
        border-inline-start-color: var(--_el-group-divider, var(--_el-variant-fill-border));
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer no size or shape falls below --el-touch-target in either direction.
       Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .button {
            min-width: var(--el-touch-target, auto);
            min-height: max(var(--_el-size-height), var(--el-touch-target, 0px));
        }

        /* A circle has a fixed width and height. The minimum wins over both, so it stays round. */
        .button--circle {
            min-height: var(--el-touch-target, auto);
        }
    }

    /* ── Caret ────────────────────────────────────────────────────────────── */

    .caret {
        display: inline-flex;
        line-height: 1;
    }

    /* ── Loading ──────────────────────────────────────────────────────────── */

    /* Keep the label in the layout (so the button doesn't resize) but hide it under the
       spinner, which is centered over the whole control. */
    .button--loading {
        cursor: wait;
    }

    .button--loading [part='label'],
    .button--loading [part='prefix'],
    .button--loading [part='suffix'],
    .button--loading .caret {
        visibility: hidden;
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        /* The ring is drawn around the 1em box, not inside it. */
        box-sizing: content-box;
        width: 1em;
        height: 1em;
        margin: -0.5em 0 0 -0.5em;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: el-button-spin 0.7s linear infinite;
    }

    @keyframes el-button-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation-duration: 1.4s;
        }
    }

    /* ── Disabled ─────────────────────────────────────────────────────────── */

    .button[disabled],
    .button[aria-disabled='true'] {
        opacity: 0.55;
        cursor: not-allowed;
        pointer-events: none;
        filter: none;
    }
`;

export default [hostStyle(), sizeStyle(), variantsStyle(), appearanceStyle('.button'), style].join('\n');

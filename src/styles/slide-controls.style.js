const css = String.raw;

/**
 * The controls of a component that shows a part of its content at a time (carousel, slider): an
 * arrow at each side of the track, and under the track a dot for every stop.
 *
 * The component marks the elements with parts, and the module selects them by those: `arrows`
 * around two `arrow`, and `dots` around a `dot` for every stop, with `selected-dot` on the one of
 * the stop that shows. An arrow that cannot be used is `:disabled`, or what the third argument
 * selects. A text for screen readers only has the class `visually-hidden`.
 *
 * Nothing says what a slide shows, so no colour of a control can be told to stand out from it. The
 * dots are in a row of their own under the track for that reason, on the page. The arrows lie on
 * the track and have a surface of their own.
 * @param {string} container - Selector of the element that has the track, the arrows and the dots
 *   as its children: `':host'`, or an element in the shadow root.
 * @param {string} track - Selector of the track, the child that shows the slides.
 * @param {string} [disabledArrow] - Selector of an arrow that cannot be used, beside `:disabled`:
 *   the part `arrow-disabled` by default, or what a library that drives the component marks it with.
 * @returns {string}
 */
export default function slideControlsStyle(container, track, disabledArrow = "[part~='arrow-disabled']") {
    const disabled = `[part~='arrow']:is(:disabled, ${disabledArrow})`;

    return css`
        /* One column and two rows: the track with the arrows on it, and the dots. What is stacked
           in here stays in here, whatever the page stacks around the component. */
        ${container} {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            isolation: isolate;
        }

        ${track},
        [part~='arrows'] {
            grid-area: 1 / 1;
        }

        [part~='dots'] {
            grid-area: 2 / 1;
        }

        /* ── Arrows ───────────────────────────────────────────────────────────── */

        /* On the track, in the middle of its height and at its two sides. The layer lets a click
           and a swipe through to the slides, the arrows take theirs. */
        [part~='arrows'] {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-inline: var(--el-space-2, 0.5rem);
            pointer-events: none;
        }

        /* A square of the control height, which grows in width with a text of the page. Without a
           theme it has the surface and the text colour of the browser for the colour scheme: an
           arrow without a surface would be a sign in the text colour of the page on a slide. */
        [part~='arrow'] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            min-width: var(--el-control-height, 2.5rem);
            min-height: var(--el-control-height, 2.5rem);
            margin: 0;
            padding: 0 var(--el-space-2, 0.5rem);
            border: var(--el-border-width, 1px) solid var(--el-color-border, currentColor);
            border-radius: var(--el-radius-md, 4px);
            background: var(--el-color-bg, Canvas);
            color: var(--el-color-fg, CanvasText);
            font-family: var(--el-font-family, inherit);
            font-size: var(--el-font-size-md, 1rem);
            line-height: 1;
            cursor: pointer;
            pointer-events: auto;
            user-select: none;
            transition: filter var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        /* Hover styles only where the pointer can hover: a touch screen keeps :hover on the arrow
           after a tap. Pressed is one step darker, and the only feedback a touch screen gets. */
        @media (hover: hover) {
            [part~='arrow']:hover {
                filter: brightness(0.95);
            }
        }

        [part~='arrow']:active {
            filter: brightness(0.88);
        }

        /* The ring is inside of the arrow, on its own surface: around it, it would lie on the
           slide, where nothing says that it can be seen. */
        [part~='arrow']:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: calc(-1 * (var(--el-focus-ring-width, 2px) + var(--el-border-width, 1px)));
        }

        /* An arrow that leads nowhere keeps its surface, and its sign fades. An arrow that fades as
           a whole, as a disabled el-button does, would let the slide under it show through. */
        ${disabled} {
            color: color-mix(in srgb, var(--el-color-fg, CanvasText) 40%, transparent);
            cursor: not-allowed;
            filter: none;
        }

        /* Where the user forces colours, a mixed colour is replaced by the one of an enabled
           button. The grey of the system says what the fading said. */
        @media (forced-colors: active) {
            ${disabled} {
                border-color: GrayText;
                color: GrayText;
            }
        }

        /* The arrow heads that are there without a content of the page. They point with the reading
           direction: the arrow back is at the right in a text that runs from right to left. */
        [part~='arrow'] slot > svg {
            width: 1.25em;
            height: 1.25em;
        }

        :host(:dir(rtl)) [part~='arrow'] slot > svg {
            transform: scaleX(-1);
        }

        /* The name of an arrow whose slot is empty: read by screen readers, not shown. */
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }

        /* ── Dots ─────────────────────────────────────────────────────────────── */

        /* A row in the middle, which breaks into a second one where it does not fit. A dot is
           small, and what takes its click is a square around it (--_el-dot-target). The dots are
           that far apart and the row is that high, so no square lies on another one or on the
           track. */
        [part~='dots'] {
            --_el-dot-size: 0.625rem;
            --_el-dot-target: 1.5rem;
            --_el-dot-space: calc(var(--_el-dot-target) - var(--_el-dot-size));
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--_el-dot-space);
            margin: 0;
            padding: calc(var(--_el-dot-space) / 2);
            list-style: none;
        }

        /* A ring, and a disc for the stop that shows: the two differ in their shape, not only in
           their colour. Both are made of the border, which keeps a colour where the user forces
           colours; a fill would not. */
        [part~='dot'] {
            position: relative;
            flex: none;
            box-sizing: border-box;
            width: var(--_el-dot-size);
            height: var(--_el-dot-size);
            margin: 0;
            padding: 0;
            border: 2px solid var(--el-color-fg-muted, currentColor);
            border-radius: 50%;
            background: transparent;
            /* The text colour of the page, also where the dot is a button: without a theme it is
               the colour of the ring, of the disc and of the focus ring. */
            color: inherit;
            font-size: inherit;
            line-height: 0;
            cursor: pointer;
            transition:
                border-color var(--el-duration-md, 0s) var(--el-ease, linear),
                border-width var(--el-duration-md, 0s) var(--el-ease, linear);
        }

        [part~='dot']::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: var(--_el-dot-target);
            height: var(--_el-dot-target);
            transform: translate(-50%, -50%);
        }

        @media (hover: hover) {
            [part~='dot']:hover {
                border-color: var(--el-color-accent, currentColor);
            }
        }

        [part~='selected-dot'] {
            border-width: calc(var(--_el-dot-size) / 2);
            border-color: var(--el-color-accent, currentColor);
        }

        /* The dots are on the page, so their ring is around them, as the one of every control. */
        [part~='dot']:focus-visible {
            outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
            outline-offset: var(--el-focus-ring-offset, 2px);
        }

        /* ── Touch screens ────────────────────────────────────────────────────── */

        /* An arrow and the square around a dot are at least --el-touch-target. The dot keeps its
           size, and the dots move apart. Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            [part~='arrow'] {
                min-width: max(var(--el-control-height, 2.5rem), var(--el-touch-target, 0px));
                min-height: max(var(--el-control-height, 2.5rem), var(--el-touch-target, 0px));
            }

            [part~='dots'] {
                --_el-dot-target: max(1.5rem, var(--el-touch-target, 0px));
            }
        }
    `;
}

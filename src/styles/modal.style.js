const css = String.raw;

/**
 * A native `<dialog>` as a modal surface with a header, a body and a footer, which `el-dialog` and
 * `el-drawer` both are. The module has what the two share:
 *
 * - the paint of the surface from the tokens: background, text colour, shadow
 * - the backdrop (`--el-dialog-overlay-background`)
 * - the way from closed to shown: the component adds the class `showing` to the dialog, and the
 *   opacity and the transform of the dialog go to their resting values in `--el-duration-md`
 * - the parts: `header`, `title`, `header-actions`, `close-button`, `body`, `footer`
 *
 * The component adds where the surface is and how large, its border and its corners, and what it
 * looks like before it is shown: an opacity, a transform or both, on the selector `dialog`. Those
 * are different properties from the ones set here, so the order of the two stylesheets does not
 * decide anything.
 *
 * The module takes no host: a dialog with slots needs a shadow root, and the host of one is
 * `:host`.
 * @returns {string}
 */
export default function modalStyle() {
    return css`
        :host {
            display: contents;
        }

        /*
         * The native <dialog> is the top-layer surface (the "panel"). It is headless by default —
         * every visual token falls back to a null-ish value so an unthemed surface imposes nothing.
         */
        dialog {
            padding: 0;
            background: var(--el-color-bg, transparent);
            color: var(--el-color-fg, inherit);
            box-shadow: var(--el-shadow-lg, none);
            transition:
                opacity var(--el-duration-md, 0s) var(--el-ease, ease),
                transform var(--el-duration-md, 0s) var(--el-ease, ease);
        }

        /* Lay the box out only while open so the UA's \`dialog:not([open]) { display: none }\` still hides it. */
        dialog[open] {
            display: flex;
            flex-direction: column;
        }

        dialog.showing {
            opacity: 1;
            transform: none;
        }

        dialog::backdrop {
            background: var(--el-dialog-overlay-background, transparent);
            opacity: 0;
            transition: opacity var(--el-duration-md, 0s) var(--el-ease, ease);
        }

        dialog.showing::backdrop {
            opacity: 1;
        }

        [part~='header'] {
            display: flex;
            align-items: center;
            gap: var(--el-space-2, 0.5rem);
            padding: var(--el-space-4, 1rem);
        }

        [part~='title'] {
            flex: 1 1 auto;
            margin: 0;
            font-size: var(--el-font-size-lg, 1.125rem);
            font-weight: var(--el-font-weight-semibold, 600);
            line-height: 1.2;
        }

        [part~='header-actions'] {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            gap: var(--el-space-2, 0.5rem);
        }

        [part~='close-button'] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: var(--el-radius-md, 0);
            background: transparent;
            color: inherit;
            cursor: pointer;
            line-height: 0;
        }

        [part~='close-button'] svg {
            width: 1.25rem;
            height: 1.25rem;
        }

        /* Touch screens: the close button is at least --el-touch-target, the icon keeps its size.
           Without the token the sizes stay as they are. */
        @media (any-pointer: coarse) {
            [part~='close-button'] {
                min-width: var(--el-touch-target, auto);
                min-height: var(--el-touch-target, auto);
            }
        }

        [part~='body'] {
            flex: 1 1 auto;
            overflow: auto;
            padding: var(--el-space-4, 1rem);
        }

        /* Header present: let the header own the top padding so the body doesn't double it. */
        [part~='header'] + [part~='body'] {
            padding-top: 0;
        }

        [part~='footer'] {
            display: flex;
            flex: 0 0 auto;
            justify-content: flex-end;
            gap: var(--el-space-2, 0.5rem);
            padding: var(--el-space-4, 1rem);
            padding-top: 0;
        }

        /* The footer is left out when nothing is slotted into it. The component sets the class:
           the footer always has its slot as a child, and a stylesheet cannot ask a slot whether
           it is empty in every browser yet. */
        [part~='footer'].is-empty {
            display: none;
        }

        @media (prefers-reduced-motion: reduce) {
            dialog,
            dialog::backdrop {
                transition-duration: 0s;
            }
        }
    `;
}

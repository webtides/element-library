import hostStyle from '../../styles/host.style.js';

const css = String.raw;

/**
 * The widths from which a frame can be wide. A stylesheet cannot read the width of a query from a
 * custom property, so there is a query per step, and the frame names the one that counts.
 */
export const STEPS = ['30rem', '40rem', '48rem', '64rem', '80rem'];
export const DEFAULT_STEP = '48rem';

/* A line between two regions. A border: it stays where the user forces colours. */
const line = 'var(--_el-app-frame-line-width) solid var(--el-color-border, transparent)';

/* What a region tells the components in it: how far its surface reaches past its content, on each
   side. An app bar in the header draws its surface that far, under the status bar of a phone. */
const noInsets = css`
    --_el-context-inset-block-start: 0px;
    --_el-context-inset-block-end: 0px;
    --_el-context-inset-inline-start: 0px;
    --_el-context-inset-inline-end: 0px;
`;

const style = css`
    /*
     * The frame fills what the browser shows: it is fixed to the four edges of the viewport, which
     * move with the address bar of a phone. It is out of the flow of the page, so it adds nothing
     * to scroll, whatever margin the body has.
     *
     * A page that wants a frame in a box of its own sets the position and a height on the element.
     */
    :host {
        /* The room the system takes at the edges of the screen: the notch, the rounded corners,
           the home indicator. Nothing without viewport-fit=cover. */
        --_el-app-frame-top: env(safe-area-inset-top, 0px);
        --_el-app-frame-bottom: env(safe-area-inset-bottom, 0px);
        --_el-app-frame-start: env(safe-area-inset-left, 0px);
        --_el-app-frame-end: env(safe-area-inset-right, 0px);
        --_el-app-frame-line-width: var(--el-border-width, 0px);

        display: block;
        position: fixed;
        inset: 0;
        /* The frame is wide or narrow by its own width. */
        container-type: inline-size;
        /* Headless without a theme: the page shows through. */
        background: var(--el-color-bg, transparent);
        color: var(--el-color-fg, inherit);
    }

    /* Asked of the host: with \`dir\` on an element around the frame, Chromium does not match
       \`:dir(rtl)\` for an element inside the shadow root. */
    :host(:dir(rtl)) {
        --_el-app-frame-start: env(safe-area-inset-right, 0px);
        --_el-app-frame-end: env(safe-area-inset-left, 0px);
    }

    /* Where the user forces colours, a line is what tells two regions apart: it is there without
       a theme as well. */
    @media (forced-colors: active) {
        :host {
            --_el-app-frame-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /* ── The link that skips to the content ───────────────────────────────── */

    .skip {
        position: absolute;
        z-index: 1;
        inset-block-start: calc(var(--_el-app-frame-top) + var(--el-space-2, 0.5rem));
        inset-inline-start: calc(var(--_el-app-frame-start) + var(--el-space-2, 0.5rem));
        padding: var(--el-space-2, 0.5rem) var(--el-space-3, 0.75rem);
        /* It lies on the header, so it has a surface without a theme as well. */
        background: var(--el-color-bg, Canvas);
        color: var(--el-color-fg, CanvasText);
        border: max(var(--el-border-width, 0px), 1px) solid var(--el-color-border, currentColor);
        border-radius: var(--el-radius-md, 0);
        font-size: var(--el-font-size-sm, 0.875rem);
    }

    /* Off the screen until the Tab key gets to it, and there for assistive technology. */
    .skip:not(:focus) {
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .skip:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: 2px;
    }

    /* ── The regions ──────────────────────────────────────────────────────── */

    /*
     * Narrow, which is the frame without a query: the header, one column that scrolls, the footer.
     */
    .frame {
        /* What the script asks: the stylesheet decides whether the frame is wide. */
        --_el-app-frame-view: narrow;

        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr) auto;
        grid-template-areas:
            'header'
            'body'
            'footer';
        block-size: 100%;
        /* Without a header or a footer the frame keeps their edge of the screen clear itself.
           The content does not scroll under the status bar then. */
        padding-block: var(--_el-app-frame-top) var(--_el-app-frame-bottom);
    }

    .frame--header {
        padding-block-start: 0;
    }

    .frame--footer {
        padding-block-end: 0;
    }

    /* The surface of the header reaches the edges of the screen, and what is in it stays clear of
       them: the padding is the room of the system. */
    .header {
        --_el-context-inset-block-start: var(--_el-app-frame-top);
        --_el-context-inset-block-end: 0px;
        --_el-context-inset-inline-start: var(--_el-app-frame-start);
        --_el-context-inset-inline-end: var(--_el-app-frame-end);

        grid-area: header;
        padding-block-start: var(--_el-app-frame-top);
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
        border-block-end: ${line};
    }

    .footer {
        --_el-context-inset-block-start: 0px;
        --_el-context-inset-block-end: var(--_el-app-frame-bottom);
        --_el-context-inset-inline-start: var(--_el-app-frame-start);
        --_el-context-inset-inline-end: var(--_el-app-frame-end);

        grid-area: footer;
        padding-block-end: var(--_el-app-frame-bottom);
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
        border-block-start: ${line};
    }

    /* The one thing that scrolls: the navigation, the content and the aside below each other. */
    .body {
        ${noInsets}

        grid-area: body;
        min-block-size: 0;
        overflow-y: auto;
        /* The end of the content is the end: the page behind the frame does not move. */
        overscroll-behavior: contain;
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
    }

    .navigation {
        border-block-end: ${line};
    }

    .aside {
        border-block-start: ${line};
    }

    /* A region that scrolls takes the focus of the keyboard where nothing in it does. The ring is
       inside: around the region there is the edge of the screen. */
    .body:focus-visible,
    .content:focus-visible,
    .navigation:focus-visible,
    .aside:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* The skip link has put the focus here, for the keys that scroll. A region is no control. */
    .content[tabindex='-1']:focus {
        outline: none;
    }
`;

/**
 * Wide: the navigation and the aside are columns beside the content, and each of the three
 * scrolls on its own. The same rules for every step, each in the query of its width.
 * @param {string} step
 * @returns {string}
 */
const wideStyle = (step) => {
    const frame = `.frame[data-wide-from='${step}']`;

    return css`
        @container (min-width: ${step}) {
            ${frame} {
                --_el-app-frame-view: wide;

                grid-template-columns: auto minmax(0, 1fr) auto;
                grid-template-areas:
                    'header header header'
                    'navigation content aside'
                    'footer footer footer';
            }

            /* The three are regions of the frame itself now. */
            ${frame} .body {
                display: contents;
            }

            ${frame} .navigation,
            ${frame} .content,
            ${frame} .aside {
                min-block-size: 0;
                overflow-y: auto;
                overscroll-behavior: contain;
            }

            /* The width the page sets is the width of what is in the region: the room of the
               system and the line come on top. */
            ${frame} .navigation,
            ${frame} .aside {
                box-sizing: content-box;
            }

            ${frame} .navigation {
                --_el-context-inset-inline-start: var(--_el-app-frame-start);

                grid-area: navigation;
                inline-size: var(--el-app-frame-navigation-size, 16rem);
                padding-inline-start: var(--_el-app-frame-start);
                border-block-end: 0;
                border-inline-end: ${line};
            }

            ${frame} .aside {
                grid-area: aside;
                inline-size: var(--el-app-frame-aside-size, 20rem);
                padding-inline-end: var(--_el-app-frame-end);
                border-block-start: 0;
                border-inline-start: ${line};
            }

            /* The content keeps the edge of the screen clear where no column is beside it. */
            ${frame} .content {
                grid-area: content;
                min-inline-size: 0;
                padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
            }

            ${frame}.frame--navigation .content {
                padding-inline-start: 0;
            }

            ${frame}.frame--aside .content {
                padding-inline-end: 0;
            }
        }
    `;
};

/*
 * On paper there is no viewport to fill: the frame is as long as its content, and nothing is cut
 * off. After the queries, and with selectors of their weight: paper can be wide or narrow.
 */
const printStyle = css`
    @media print {
        :host {
            position: static;
        }

        .frame[data-wide-from] {
            display: block;
            block-size: auto;
        }

        .frame[data-wide-from] .body,
        .frame[data-wide-from] .navigation,
        .frame[data-wide-from] .content,
        .frame[data-wide-from] .aside {
            display: block;
            inline-size: auto;
            overflow: visible;
        }

        .skip {
            display: none;
        }
    }
`;

export default [hostStyle(), style, ...STEPS.map(wideStyle), printStyle].join('\n');

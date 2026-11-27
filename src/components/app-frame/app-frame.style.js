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
        /* The line to the content is drawn here: a bar in the region leaves its own out. */
        --_el-context-line-block-end: 0px;

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
        --_el-context-line-block-start: 0px;

        grid-area: footer;
        padding-block-end: var(--_el-app-frame-bottom);
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
        border-block-start: ${line};
    }

    /* The navigation does not show where the frame is narrow. The script puts it into a drawer
       there, which opens from any element with data-navigation-toggle. */
    .navigation {
        display: none;
    }

    /* An el-button that opens the navigation is not there where there is nothing to open: no
       navigation, one for the wide frame only, or one that is a bar at the lower edge. It reads
       this in its own stylesheet. */
    .frame:not(.frame--navigation),
    .frame[data-wide-only~='navigation'],
    .frame[data-narrow-navigation='bar'] {
        --_el-context-navigation-toggle-display: none;
    }

    /*
     * The navigation as a bar: its region lies at the lower edge, over the footer. It is a surface
     * of the frame there, as the footer is: it reaches the sides of the screen, and the lower edge
     * where no footer is below it, and what is in it stays clear of them.
     */
    .frame[data-narrow-navigation='bar'] {
        grid-template-rows: auto minmax(0, 1fr) auto auto;
        grid-template-areas:
            'header'
            'body'
            'navigation'
            'footer';
    }

    .frame[data-narrow-navigation='bar'] .navigation {
        --_el-context-inset-block-start: 0px;
        --_el-context-inset-block-end: 0px;
        --_el-context-inset-inline-start: var(--_el-app-frame-start);
        --_el-context-inset-inline-end: var(--_el-app-frame-end);
        --_el-context-line-block-start: 0px;

        display: block;
        grid-area: navigation;
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
        border-block-start: ${line};
    }

    .frame[data-narrow-navigation='bar'].frame--navigation:not(.frame--footer) {
        padding-block-end: 0;
    }

    .frame[data-narrow-navigation='bar']:not(.frame--footer) .navigation {
        --_el-context-inset-block-end: var(--_el-app-frame-bottom);

        padding-block-end: var(--_el-app-frame-bottom);
    }

    /* The drawer of the navigation: as wide as the column is, and the navigation of the page
       brings its own padding. */
    .drawer {
        --el-drawer-size: var(--el-app-frame-navigation-size, 16rem);
        /* An el-nav in the drawer has its destinations below each other. */
        --_el-context-nav-rail: ;
    }

    .drawer::part(body) {
        padding: 0;
    }

    /* A drawer hides what is in it while it is closed, but only once it has rendered. Until then
       the navigation of the page would show in the place of the drawer, for a frame. */
    .drawer:not(:state(connected)) {
        display: none;
    }

    /* The edges the user drags are at the sides of columns: there are none where the frame is
       narrow. An edge that has not rendered yet is not there either. */
    .edge {
        display: none;
    }

    /* The one thing that scrolls: the content and the aside below each other. */
    .body {
        ${noInsets}

        grid-area: body;
        min-block-size: 0;
        overflow-y: auto;
        /* The end of the content is the end: the page behind the frame does not move. */
        overscroll-behavior: contain;
        padding-inline: var(--_el-app-frame-start) var(--_el-app-frame-end);
    }

    .aside {
        border-block-start: ${line};
    }

    /* A region the page has only where the frame is wide is not there while it is narrow. The
       frame keeps the edge of a header or a footer that is not there clear itself. */
    .frame[data-wide-only~='header'] .header,
    .frame[data-wide-only~='navigation'] .navigation,
    .frame[data-wide-only~='aside'] .aside,
    .frame[data-wide-only~='footer'] .footer {
        display: none;
    }

    .frame[data-wide-only~='header'] {
        padding-block-start: var(--_el-app-frame-top);
    }

    .frame[data-wide-only~='footer'] {
        padding-block-end: var(--_el-app-frame-bottom);
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
                /* The navigation is a column: there is no drawer to open. */
                --_el-context-navigation-toggle-display: none;

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
                ${noInsets}
                --_el-context-inset-inline-start: var(--_el-app-frame-start);
                /* The region draws the line to the content, and an el-nav in it is a rail. */
                --_el-context-line-inline-end: 0px;
                --_el-context-nav-rail: ;
                --_el-context-line-block-start: initial;

                display: block;
                grid-area: navigation;
                inline-size: var(--_el-app-frame-navigation-size, var(--el-app-frame-navigation-size, 16rem));
                padding-block-end: 0;
                padding-inline: var(--_el-app-frame-start) 0;
                border-block-start: 0;
                border-inline-end: ${line};
            }

            /* The column of a navigation that is a bar where the frame is narrow is as wide as
               what is in it: a rail. */
            ${frame}[data-narrow-navigation='bar'] .navigation {
                inline-size: var(--_el-app-frame-navigation-size, var(--el-app-frame-navigation-size, auto));
            }

            ${frame}[data-narrow-navigation='bar'] {
                grid-template-rows: auto minmax(0, 1fr) auto;
            }

            ${frame}[data-narrow-navigation='bar'].frame--navigation:not(.frame--footer) {
                padding-block-end: var(--_el-app-frame-bottom);
            }

            /* The column does not reach the lower edge of the screen as the bar did: the frame
               keeps that edge clear. */
            ${frame}[data-narrow-navigation='bar']:not(.frame--footer) .navigation {
                --_el-context-inset-block-end: 0px;

                padding-block-end: 0;
            }

            ${frame} .aside {
                grid-area: aside;
                inline-size: var(--_el-app-frame-aside-size, var(--el-app-frame-aside-size, 20rem));
                padding-inline-end: var(--_el-app-frame-end);
                border-block-start: 0;
                border-inline-start: ${line};
            }

            /*
             * A column whose edge the user drags keeps between a least and a greatest width,
             * whatever width is kept for it: the stylesheet holds the limits, before the script
             * has run and when the frame gets narrower. The greatest one is a share of the frame
             * by default, so the content keeps a part of it.
             */
            ${frame}[data-resizable~='navigation'] .navigation {
                min-inline-size: var(--el-app-frame-navigation-min-size, 10rem);
                max-inline-size: var(--el-app-frame-navigation-max-size, min(30rem, 40cqi));
            }

            ${frame}[data-resizable~='aside'] .aside {
                min-inline-size: var(--el-app-frame-aside-min-size, 10rem);
                max-inline-size: var(--el-app-frame-aside-max-size, min(30rem, 40cqi));
            }

            /* The edge lies on the line of its column, which the column draws: it is in the
               place of the column in the grid, at the side that faces the content. */
            ${frame} .edge:state(connected) {
                --el-splitter-line-width: 0px;

                display: block;
                min-block-size: 0;
            }

            ${frame} .edge--navigation {
                grid-area: navigation;
                justify-self: end;
            }

            ${frame} .edge--aside {
                grid-area: aside;
                justify-self: start;
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

            /* The regions the page has only where the frame is wide are there now, and the ones
               it has only where the frame is narrow are not. What was beside or above them keeps
               that edge of the screen clear. */
            ${frame}[data-wide-only~='header'] .header,
            ${frame}[data-wide-only~='navigation'] .navigation,
            ${frame}[data-wide-only~='aside'] .aside,
            ${frame}[data-wide-only~='footer'] .footer {
                display: block;
            }

            ${frame}[data-wide-only~='header'].frame--header {
                padding-block-start: 0;
            }

            ${frame}[data-wide-only~='footer'].frame--footer {
                padding-block-end: 0;
            }

            ${frame}[data-narrow-only~='header'] .header,
            ${frame}[data-narrow-only~='navigation'] .navigation,
            ${frame}[data-narrow-only~='navigation'] .edge--navigation,
            ${frame}[data-narrow-only~='aside'] .aside,
            ${frame}[data-narrow-only~='aside'] .edge--aside,
            ${frame}[data-narrow-only~='footer'] .footer {
                display: none;
            }

            ${frame}[data-narrow-only~='header'] {
                padding-block-start: var(--_el-app-frame-top);
            }

            ${frame}[data-narrow-only~='footer'] {
                padding-block-end: var(--_el-app-frame-bottom);
            }

            ${frame}[data-narrow-only~='navigation'] .content {
                padding-inline-start: var(--_el-app-frame-start);
            }

            ${frame}[data-narrow-only~='aside'] .content {
                padding-inline-end: var(--_el-app-frame-end);
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

        .frame[data-wide-from] .body {
            display: block;
        }

        .frame[data-wide-from] .body,
        .frame[data-wide-from] .navigation,
        .frame[data-wide-from] .content,
        .frame[data-wide-from] .aside {
            inline-size: auto;
            overflow: visible;
        }

        /* And a column has no limits of its width. */
        .frame[data-wide-from][data-resizable] .navigation,
        .frame[data-wide-from][data-resizable] .aside {
            min-inline-size: 0;
            max-inline-size: none;
        }

        .frame[data-wide-from] .edge:state(connected) {
            display: none;
        }

        .skip {
            display: none;
        }
    }
`;

export default [hostStyle(), style, ...STEPS.map(wideStyle), printStyle].join('\n');

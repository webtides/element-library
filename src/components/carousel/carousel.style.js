import slideControlsStyle from '../../styles/slide-controls.style.js';

const css = String.raw;

// Glide's core CSS is inlined here rather than `@import`-ed, because element-js applies component
// styles as constructed/adopted stylesheets, where `@import` is not allowed. Sourced from
// @glidejs/glide@3.6.x dist/css/glide.core.css. The theme of Glide is not here: the arrows and the
// bullets have the look and the place of the shared module, as the ones of the slider.
const style = css`
    :host {
        display: block;
    }

    /* --- Glide core --- */
    .glide {
        position: relative;
        width: 100%;
        box-sizing: border-box;
    }
    .glide * {
        box-sizing: inherit;
    }
    .glide__track {
        overflow: hidden;
    }
    .glide__slides {
        position: relative;
        width: 100%;
        list-style: none;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        touch-action: pan-Y;
        overflow: hidden;
        margin: 0;
        padding: 0;
        white-space: nowrap;
        display: flex;
        flex-wrap: nowrap;
        will-change: transform;
    }
    .glide__slides--dragging {
        user-select: none;
    }
    .glide__arrows,
    .glide__bullets {
        -webkit-touch-callout: none;
        user-select: none;
    }
    .glide--rtl {
        direction: rtl;
    }

    /* Slotted slides stand in for .glide__slide — the real slides are projected light-DOM children. */
    ::slotted(*) {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        white-space: normal;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* The clones Glide needs for looping are copies of slides, kept in this shadow root. They get
       what the slides get, and :where() lets a rule of the page win, as it does for a slide. */
    :where(.glide__slide--clone) {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        white-space: normal;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }

    .glide--swipeable {
        cursor: grab;
    }
    .glide--dragging {
        cursor: grabbing;
    }
`;

// Glide marks an arrow that leads nowhere with a class and leaves the button enabled: a carousel of
// the type slider at its first and at its last slide.
export default [slideControlsStyle('.glide', '.glide__track', '.glide__arrow--disabled'), style].join('\n');

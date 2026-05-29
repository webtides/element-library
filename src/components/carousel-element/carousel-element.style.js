const css = String.raw;

// Glide's core + theme CSS is inlined here rather than `@import`-ed, because element-js
// applies component styles as constructed/adopted stylesheets, where `@import` is not
// allowed. Sourced from @glidejs/glide@3.6.x dist/css/glide.{core,theme}.css.
export default css`
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

    /* --- Glide theme: arrows --- */
    .glide__arrow {
        position: absolute;
        display: block;
        top: 50%;
        z-index: 2;
        color: white;
        text-transform: uppercase;
        padding: 9px 12px;
        background-color: transparent;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 4px;
        box-shadow: 0 0.25em 0.5em 0 rgba(0, 0, 0, 0.1);
        text-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.1);
        opacity: 1;
        cursor: pointer;
        transition:
            opacity 150ms ease,
            border 300ms ease-in-out;
        transform: translateY(-50%);
        line-height: 1;
    }
    .glide__arrow:focus {
        outline: none;
    }
    .glide__arrow:hover {
        border-color: white;
    }
    .glide__arrow--left {
        left: 2em;
    }
    .glide__arrow--right {
        right: 2em;
    }
    .glide__arrow--disabled {
        opacity: 0.33;
    }

    /* --- Glide theme: bullets --- */
    .glide__bullets {
        position: absolute;
        z-index: 2;
        bottom: 2em;
        left: 50%;
        display: inline-flex;
        list-style: none;
        transform: translateX(-50%);
    }
    .glide__bullet {
        background-color: rgba(255, 255, 255, 0.5);
        width: 9px;
        height: 9px;
        padding: 0;
        border-radius: 50%;
        border: 2px solid transparent;
        transition: all 300ms ease-in-out;
        cursor: pointer;
        line-height: 0;
        box-shadow: 0 0.25em 0.5em 0 rgba(0, 0, 0, 0.1);
        margin: 0 0.25em;
    }
    .glide__bullet:focus {
        outline: none;
    }
    .glide__bullet:hover,
    .glide__bullet:focus {
        border: 2px solid white;
        background-color: rgba(255, 255, 255, 0.5);
    }
    /* Active bullet. The component marks it with the selected-dot part (Glide's Controls
       component, which would add .glide__bullet--active, is not mounted). */
    .glide__bullet[part~='selected-dot'] {
        background-color: white;
    }

    .glide--swipeable {
        cursor: grab;
    }
    .glide--dragging {
        cursor: grabbing;
    }
`;

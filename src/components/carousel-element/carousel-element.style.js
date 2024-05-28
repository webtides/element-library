const css = String.raw;

export default css`
    @import '@glidejs/glide/dist/css/glide.core.css';
    @import '@glidejs/glide/dist/css/glide.theme.css';

    :host {
        display: block;
    }

    ::slotted(*) {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        white-space: normal;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }

    .glide__slides {
        display: flex;
    }
`;

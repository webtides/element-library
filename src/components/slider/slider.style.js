import slideControlsStyle from '../../styles/slide-controls.style.js';

const css = String.raw;

// The arrows and the dots have the look and the place of the shared module, as the ones of the
// carousel. The module lays the host out: the scroller with the arrows on it, and the dots under it.
const style = css`
    :host {
        position: relative;
    }

    ol,
    ul,
    li {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .scroller {
        display: flex;
        overflow-x: scroll;
        position: relative;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        counter-reset: item;
        scroll-snap-type: x mandatory;
    }

    .scroller::-webkit-scrollbar {
        display: none;
    }

    ::slotted(.item) {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        scroll-snap-align: var(--snap-align, center);
        width: var(--item-width, 100%);
    }
`;

export default [slideControlsStyle(':host', '.scroller'), style].join('\n');

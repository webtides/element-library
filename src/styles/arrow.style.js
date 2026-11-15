import { hostSelector } from './host.style.js';

const css = String.raw;

const size = 'var(--_el-arrow-size)';
/* Half of the square, and the border of the surface, outside of its padding box. */
const offset = `calc(${size} / -2 - var(--el-border-width, 1px))`;

/**
 * The arrow of a floating surface, which points to its anchor: an element with the class `arrow`
 * inside the surface. It is a square with the background and the border of the surface, turned by
 * 45 degrees, with its middle on the outer edge of the surface. Only the two sides of the square
 * that stick out have a border.
 *
 * The surface carries `data-placement` with the side of the anchor it is at, and the arrow sits on
 * the edge that faces the anchor. `placeAtAnchor()` in `utils/floating.js` sets that attribute and
 * the place of the arrow along the edge. The surface has to be positioned and must not clip
 * (`overflow: visible`), because the arrow sticks out.
 * @param {string} [surface] - Selector of the floating surface: `':host'` (the default) when the
 *   component is the surface itself, or the element inside it, `"[part~='panel']"` for example.
 * @returns {string}
 */
export default function arrowStyle(surface = ':host') {
    const placed = (side) => `${hostSelector(surface, `[data-placement^='${side}']`)} .arrow`;

    return css`
        .arrow {
            --_el-arrow-size: 0.75rem;
            position: absolute;
            width: ${size};
            height: ${size};
            background: inherit;
            border: inherit;
            transform: rotate(45deg);
        }

        /* The two sides of the square that lie inside the surface have no border. Their width goes,
           not their colour: a user who forces colours (a contrast theme of Windows) gets a colour
           for every border, a transparent one as well, and the two lines would run across the
           corner of the surface. */
        ${placed('bottom')} {
            top: ${offset};
            border-right-width: 0;
            border-bottom-width: 0;
        }

        ${placed('top')} {
            bottom: ${offset};
            border-top-width: 0;
            border-left-width: 0;
        }

        ${placed('right')} {
            left: ${offset};
            border-top-width: 0;
            border-right-width: 0;
        }

        ${placed('left')} {
            right: ${offset};
            border-bottom-width: 0;
            border-left-width: 0;
        }
    `;
}

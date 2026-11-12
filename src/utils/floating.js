import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

/** How close to the edge of the viewport a floating element may come, and its arrow to one of its corners. */
const EDGE_PADDING = 8;

/**
 * Places a floating element at its anchor: at the side that `placement` names, on the opposite side
 * when it has no room there, and pushed back along the edge of the viewport when it would leave it.
 *
 * The floating element is positioned `fixed`. It gets `left` and `top` in the coordinates of the
 * viewport and `data-placement` with the side it ended up at, which is not the one asked for when
 * it had no room there. The stylesheet puts the arrow on the edge that faces the anchor by that
 * attribute (see the `arrow` style module); its place along the edge is set here.
 * @param {Element} anchor - The element to place at.
 * @param {HTMLElement} floating - The element to place.
 * @param {object} options
 * @param {string} options.placement - `top`, `bottom`, `left` or `right`, each also with `-start`
 *   or `-end`.
 * @param {number} [options.distance] - The gap between the anchor and the floating element, or the
 *   tip of its arrow, in pixels.
 * @param {HTMLElement} [options.arrowElement] - The arrow of the floating element, if it has one.
 * @returns {Promise<{ placement: string, gap: number }>} The side the element ended up at, and the
 *   gap between it and its anchor in pixels, the arrow included.
 */
export async function placeAtAnchor(anchor, floating, { placement, distance = 0, arrowElement }) {
    // The arrow is a square turned by 45 degrees with its middle on the edge of the floating
    // element, so half of its diagonal sticks out.
    const arrowLength = arrowElement ? arrowElement.offsetWidth * Math.SQRT1_2 : 0;
    const gap = (Number(distance) || 0) + arrowLength;

    const {
        x,
        y,
        placement: placed,
        middlewareData,
    } = await computePosition(anchor, floating, {
        placement,
        strategy: 'fixed',
        middleware: [
            offset(gap),
            flip(),
            shift({ padding: EDGE_PADDING }),
            ...(arrowElement ? [arrow({ element: arrowElement, padding: EDGE_PADDING })] : []),
        ],
    });

    Object.assign(floating.style, { left: `${x}px`, top: `${y}px` });
    if (floating.dataset.placement !== placed) floating.dataset.placement = placed;

    if (arrowElement) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
        Object.assign(arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
        });
    }

    return { placement: placed, gap };
}

/**
 * Calls `update` now, and again whenever a floating element has to be placed anew: on scroll, on
 * resize, when the anchor or the floating element changes its size.
 * @param {Element} anchor
 * @param {HTMLElement} floating
 * @param {() => void} update - Places the floating element, with `placeAtAnchor()` as a rule.
 * @returns {() => void} Stops it.
 */
export function followAnchor(anchor, floating, update) {
    return autoUpdate(anchor, floating, update);
}

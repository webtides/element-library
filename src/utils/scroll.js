/**
 * The element that scrolls what an element is in, up and down: the nearest one around it that has
 * more content than height and an overflow that scrolls. `null` where that is the document, which
 * the window scrolls.
 *
 * The way up goes through slots and out of shadow roots: an element in the content of an
 * `el-app-frame` is scrolled by a region in the shadow root of the frame.
 * @param {Element} element
 * @returns {HTMLElement | null}
 */
export function scrollContainer(element) {
    let node = element.assignedSlot ?? element.parentNode ?? element.host;

    while (node) {
        if (node instanceof Element && node !== document.documentElement && node !== document.body) {
            const { overflowY } = getComputedStyle(node);
            const scrolls = overflowY === 'auto' || overflowY === 'scroll';
            if (scrolls && node.scrollHeight > node.clientHeight) return node;
        }
        node = node.assignedSlot ?? node.parentNode ?? node.host;
    }

    return null;
}

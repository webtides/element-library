/**
 * Ref-counted body-scroll lock. The first caller to lock takes the lock (hiding overflow on the
 * document element); it is only released once every caller has unlocked. This lets stacked overlays
 * (e.g. multiple open dialogs) cooperate without one closing dialog re-enabling scrolling for
 * another that is still open.
 *
 * Hiding the root overflow removes the scrollbar, which would otherwise widen the page content and
 * cause a visible layout shift. To prevent that, the lock pads the document element by the width of
 * the scrollbar it just removed (a no-op on overlay-scrollbar systems, where the width is 0).
 */

let scrollLockCount = 0;
let previousRootOverflow = '';
let previousRootPaddingRight = '';

/** Locks scrolling on the document element, compensating for the removed scrollbar width. */
export function lockBodyScroll() {
    if (scrollLockCount === 0) {
        const root = document.documentElement;
        // Measure the scrollbar before hiding it: viewport width minus the content (client) width.
        const scrollbarWidth = window.innerWidth - root.clientWidth;

        previousRootOverflow = root.style.overflow;
        previousRootPaddingRight = root.style.paddingRight;

        root.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            const currentPaddingRight = parseFloat(getComputedStyle(root).paddingRight) || 0;
            root.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }
    }
    scrollLockCount += 1;
}

/** Releases one lock; restores the original overflow and padding once the last lock is released. */
export function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
        const root = document.documentElement;
        root.style.overflow = previousRootOverflow;
        root.style.paddingRight = previousRootPaddingRight;
    }
}

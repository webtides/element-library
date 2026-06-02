/** Largest comma-separated time (in seconds) from a computed transition value, e.g. "0.2s, 0.3s". */
function maxSeconds(value) {
    return Math.max(0, ...value.split(',').map((part) => parseFloat(part) || 0));
}

/**
 * Resolves once `element`'s running CSS transition finishes — or immediately when none is set
 * (e.g. an unthemed component, or `prefers-reduced-motion` collapsing the duration to `0s`).
 * @param {Element} element
 * @returns {Promise<void>}
 */
export function afterTransition(element) {
    return new Promise((resolve) => {
        const styles = getComputedStyle(element);
        const duration = maxSeconds(styles.transitionDuration) + maxSeconds(styles.transitionDelay);
        if (duration === 0) {
            resolve();
            return;
        }
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            element.removeEventListener('transitionend', onEnd);
            resolve();
        };
        const onEnd = (event) => {
            if (event.target === element) finish();
        };
        element.addEventListener('transitionend', onEnd);
        // Safety net in case `transitionend` never fires (interrupted transition, hidden tab, …).
        setTimeout(finish, duration * 1000 + 50);
    });
}

/** Resolves after two animation frames — long enough for an enter starting-style to be committed. */
export function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

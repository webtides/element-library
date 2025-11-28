/**
 * Test helpers for web component testing with Vitest
 * Provides minimal utilities for rendering and timing in browser tests
 */

/**
 * Creates a fixture by rendering HTML into the document body
 * @param {string} html - HTML string to render
 * @returns {Promise<Element>} The created element
 */
export async function fixture(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const element = template.content.firstElementChild;
    document.body.appendChild(element);

    // Wait for the element to be connected and any initial rendering to complete
    await nextFrame();
    await nextFrame();

    return element;
}

/**
 * Creates a fixture synchronously
 * @param {string} html - HTML string to render
 * @returns {Element} The created element
 */
export function fixtureSync(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const element = template.content.firstElementChild;
    document.body.appendChild(element);
    return element;
}

/**
 * Waits for the next animation frame
 * @returns {Promise<void>}
 */
export function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function aTimeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for a single event to be fired on an element
 * @param {EventTarget} element - Element to listen to
 * @param {string} eventName - Name of the event
 * @returns {Promise<Event>} The event object
 */
export function oneEvent(element, eventName) {
    return new Promise((resolve) => {
        element.addEventListener(eventName, resolve, { once: true });
    });
}

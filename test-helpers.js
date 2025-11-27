/**
 * Test helpers for web component testing with Vitest
 * Replaces @open-wc/testing utilities
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

/**
 * Chai-style assertion helpers
 * These are simple wrappers around Vitest's expect for compatibility
 */
export const assert = {
    equal(actual, expected, message) {
        expect(actual, message).toBe(expected);
    },
    notEqual(actual, expected, message) {
        expect(actual, message).not.toBe(expected);
    },
    isTrue(value, message) {
        expect(value, message).toBe(true);
    },
    isFalse(value, message) {
        expect(value, message).toBe(false);
    },
    isNull(value, message) {
        expect(value, message).toBeNull();
    },
    isNotNull(value, message) {
        expect(value, message).not.toBeNull();
    },
    isDefined(value, message) {
        expect(value, message).toBeDefined();
    },
    isUndefined(value, message) {
        expect(value, message).toBeUndefined();
    },
    instanceOf(value, constructor, message) {
        expect(value, message).toBeInstanceOf(constructor);
    },
    include(haystack, needle, message) {
        expect(haystack, message).toContain(needle);
    },
    match(value, regex, message) {
        expect(value, message).toMatch(regex);
    },
};

/**
 * Generates a unique custom element name for testing
 * @param {string} base - Base name for the element
 * @returns {string} Unique element name
 */
export function defineCE(base = 'test-element') {
    const id = Math.random().toString(36).substring(2, 9);
    return `${base}-${id}`;
}

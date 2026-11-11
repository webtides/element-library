/**
 * Test helpers for web component testing with Vitest
 * Provides minimal utilities for rendering and timing in browser tests
 */

import { afterAll, beforeAll } from 'vite-plus/test';
import { cdp } from 'vite-plus/test/browser';

/**
 * Makes the page a touch screen for the tests of the surrounding `describe`: `(any-pointer: coarse)`
 * matches and `(hover: hover)` does not. Switched off again after the last of these tests.
 * Chromium only.
 * @returns {void}
 */
export function useTouchScreen() {
    beforeAll(() => emulateTouchScreen(true));
    afterAll(() => emulateTouchScreen(false));
}

/**
 * Switches the touch screen emulation of the page on or off.
 * @param {boolean} enabled
 * @returns {Promise<void>}
 */
export async function emulateTouchScreen(enabled) {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled });
    await nextFrame();
}

/**
 * Puts an element into the given states, as "Force element state" in the developer tools does:
 * `forcePseudoClasses(button, ['hover', 'active'])`. Chromium only. Use a fresh element per test:
 * after a state is taken back, `getComputedStyle()` can still report the forced style.
 *
 * Real input is no alternative for a test: whether a synthetic finger sets `:active` depends on
 * the platform (it does not in headless Chromium on Linux), and on what the page has seen before.
 * @param {Element} element - May be inside a shadow root.
 * @param {Array<'hover' | 'active' | 'focus' | 'focus-visible'>} pseudoClasses
 * @returns {Promise<void>}
 */
export async function forcePseudoClasses(element, pseudoClasses) {
    const session = cdp();
    await session.send('DOM.enable');
    await session.send('CSS.enable');

    // The protocol addresses a node by an id of its own. The search finds the element by a marker
    // attribute; unlike a selector query it also looks into iframes (a test file runs in one) and
    // shadow roots.
    const marker = `forced-state-${crypto.randomUUID()}`;
    element.setAttribute('data-test-marker', marker);
    await session.send('DOM.getDocument', { depth: 0 });
    const { searchId, resultCount } = await session.send('DOM.performSearch', {
        query: marker,
        includeUserAgentShadowDOM: true,
    });
    if (resultCount < 1) throw new Error('forcePseudoClasses: the element is not in the document');
    const { nodeIds } = await session.send('DOM.getSearchResults', { searchId, fromIndex: 0, toIndex: 1 });
    await session.send('DOM.discardSearchResults', { searchId });
    element.removeAttribute('data-test-marker');

    await session.send('CSS.forcePseudoState', { nodeId: nodeIds[0], forcedPseudoClasses: pseudoClasses });
    await nextFrame();
}

/**
 * The rendered size of an element, rounded to tenths of a pixel.
 * @param {Element} element
 * @returns {{ width: number, height: number }}
 */
export function sizeOf(element) {
    const { width, height } = element.getBoundingClientRect();
    return { width: Math.round(width * 10) / 10, height: Math.round(height * 10) / 10 };
}

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

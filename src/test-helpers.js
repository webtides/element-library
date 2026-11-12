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
 *
 * Switching off does not bring a mouse back everywhere. Headless Chromium on Linux, which the CI
 * runs, has no pointer at all afterwards, and test files share a page. `(any-pointer: coarse)` is
 * false again, but no test may rely on `(hover: hover)` being true.
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
 * Makes `(prefers-reduced-motion: reduce)` match for the tests of the surrounding `describe`, and
 * takes that back after the last of them. Chromium only.
 *
 * Test files share a page, and the themes and several components behave differently under that
 * media query. So the helper fails loudly if the page does not get its own setting back.
 * @returns {void}
 */
export function useReducedMotion() {
    const query = '(prefers-reduced-motion: reduce)';
    let before;
    beforeAll(async () => {
        before = matchMedia(query).matches;
        await emulateReducedMotion(true);
    });
    afterAll(async () => {
        await emulateReducedMotion(false);
        if (matchMedia(query).matches !== before) {
            throw new Error('useReducedMotion: the page did not get its own setting back');
        }
    });
}

/**
 * Switches the emulation of `(prefers-reduced-motion: reduce)` on or off.
 * @param {boolean} enabled
 * @returns {Promise<void>}
 */
export async function emulateReducedMotion(enabled) {
    await cdp().send('Emulation.setEmulatedMedia', {
        // An empty value takes the emulation of that one feature back.
        features: [{ name: 'prefers-reduced-motion', value: enabled ? 'reduce' : '' }],
    });
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
    // Enables the DOM domain, which the CSS domain needs before it can be enabled itself.
    const nodeId = await protocolNodeId(session, element);
    await session.send('CSS.enable');

    await session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudoClasses });
    await nextFrame();
}

/**
 * The accessible name of an element as the browser computes it, which is what a screen reader
 * announces: `await accessibleName(button)`. It follows `aria-labelledby` and slots, which the
 * attributes of the element alone do not tell. Chromium only.
 * @param {Element} element - May be inside a shadow root.
 * @returns {Promise<string>}
 */
export async function accessibleName(element) {
    return (await accessibilityNode(element))?.name?.value ?? '';
}

/**
 * The accessible description of an element as the browser computes it, from `aria-describedby`
 * or `aria-description`: `await accessibleDescription(button)`. Chromium only.
 * @param {Element} element - May be inside a shadow root.
 * @returns {Promise<string>}
 */
export async function accessibleDescription(element) {
    return (await accessibilityNode(element))?.description?.value ?? '';
}

/**
 * The node of an element in the accessibility tree of the browser.
 * @param {Element} element - May be inside a shadow root.
 * @returns {Promise<object | undefined>}
 */
async function accessibilityNode(element) {
    const session = cdp();
    const nodeId = await protocolNodeId(session, element);
    const { nodes } = await session.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    return nodes[0];
}

/**
 * The id by which the DevTools protocol addresses an element. Every call fetches the document
 * again, which makes the ids of earlier calls invalid.
 * @param {ReturnType<typeof cdp>} session
 * @param {Element} element - May be inside a shadow root.
 * @returns {Promise<number>}
 */
async function protocolNodeId(session, element) {
    await session.send('DOM.enable');

    // The search finds the element by a marker attribute; unlike a selector query it also looks
    // into iframes (a test file runs in one) and shadow roots.
    const marker = `test-marker-${crypto.randomUUID()}`;
    element.setAttribute('data-test-marker', marker);
    await session.send('DOM.getDocument', { depth: 0 });
    const { searchId, resultCount } = await session.send('DOM.performSearch', {
        query: marker,
        includeUserAgentShadowDOM: true,
    });
    if (resultCount < 1) throw new Error('The element is not in the document');
    const { nodeIds } = await session.send('DOM.getSearchResults', { searchId, fromIndex: 0, toIndex: 1 });
    await session.send('DOM.discardSearchResults', { searchId });
    element.removeAttribute('data-test-marker');

    return nodeIds[0];
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

/**
 * Test helpers for web component testing with Vitest
 * Provides minimal utilities for rendering and timing in browser tests
 */

import { afterAll, beforeAll } from 'vite-plus/test';
import { cdp } from 'vite-plus/test/browser';

/**
 * Makes the page a touch screen for the tests of the surrounding `describe`: `(any-pointer: coarse)`
 * matches and `(hover: hover)` does not. Chromium only. Every test file runs in a page of its own,
 * so other files are not affected.
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
 * The center of an element in the coordinates of the top-level page. Input that is sent through
 * `cdp()` uses these, while a test file runs in an iframe. Scrolls the element into view first.
 * @param {Element} element
 * @returns {{ x: number, y: number }}
 */
export function pagePointOf(element) {
    element.scrollIntoView({ block: 'center' });
    const rect = element.getBoundingClientRect();
    const frame = window.frameElement.getBoundingClientRect();
    return { x: frame.left + rect.left + rect.width / 2, y: frame.top + rect.top + rect.height / 2 };
}

/**
 * Sends a real mouse event to the center of an element.
 * @param {'mouseMoved' | 'mousePressed' | 'mouseReleased'} type
 * @param {Element} element
 * @returns {Promise<void>}
 */
export async function sendMouse(type, element) {
    const button = type === 'mouseMoved' ? 'none' : 'left';
    await cdp().send('Input.dispatchMouseEvent', { type, ...pagePointOf(element), button, clickCount: 1 });
    await nextFrame();
}

/**
 * Puts a finger on the center of an element and lifts it after `duration` milliseconds. Needs
 * `useTouchScreen()`. The promise resolves once the finger is up.
 * @param {Element} element
 * @param {number} duration
 * @returns {Promise<void>}
 */
export function touchAndHold(element, duration) {
    return cdp().send('Input.synthesizeTapGesture', { ...pagePointOf(element), duration, gestureSourceType: 'touch' });
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

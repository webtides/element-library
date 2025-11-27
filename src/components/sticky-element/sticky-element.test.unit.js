/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import StickyElement, { define } from './sticky-element.js';
define();

describe('Unit | StickyElement', () => {
    it('can be created without errors', async () => {
        const el = new StickyElement();
    });
});

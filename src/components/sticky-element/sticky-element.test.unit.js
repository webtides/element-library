/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import StickyElement, { define } from './sticky-element.js';
define();

describe('Unit | StickyElement', () => {
    it('can be created without errors', async () => {
        const el = new StickyElement();
    });
});

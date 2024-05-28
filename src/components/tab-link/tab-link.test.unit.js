/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import TabLink, { define } from './tab-link.js';
define();

describe('Unit | TabLink', () => {
    it('can be created without errors', async () => {
        const el = new TabLink();
    });
});

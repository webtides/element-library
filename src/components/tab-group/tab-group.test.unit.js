/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import TabGroup, { define } from './tab-group.js';
define();

describe('Unit | TabGroup', () => {
    it('can be created without errors', async () => {
        const el = new TabGroup();
    });
});

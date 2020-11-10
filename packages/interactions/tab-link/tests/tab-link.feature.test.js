/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/tab-link';
define();

describe('Feature | TabLink', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<tab-link></tab-link>`);
        await nextFrame();
    });
});


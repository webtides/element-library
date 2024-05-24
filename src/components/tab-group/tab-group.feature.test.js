/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/tab-group';
define();

describe('Feature | TabGroup', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<tab-group></tab-group>`);
        await nextFrame();
    });
});

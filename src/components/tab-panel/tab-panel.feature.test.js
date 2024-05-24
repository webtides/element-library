/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/tab-panel';
define();

describe('Feature | TabPanel', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<tab-panel></tab-panel>`);
        await nextFrame();
    });
});

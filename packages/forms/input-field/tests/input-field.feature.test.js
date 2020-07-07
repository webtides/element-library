/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/input-field';
define();

describe('Feature | InputField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<input-field></input-field>`);
        await nextFrame();
    });
});


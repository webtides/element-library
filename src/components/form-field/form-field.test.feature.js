/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/form-field';
define();

describe('Feature | FormField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<form-field></form-field>`);
        await nextFrame();
    });
});

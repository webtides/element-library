/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/select-field';
define();

describe('Feature | SelectField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<select-field></select-field>`);
        await nextFrame();
    });
});


/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/checkbox-field';
define();

describe('Feature | CheckboxField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<checkbox-field></checkbox-field>`);
        await nextFrame();
    });
});

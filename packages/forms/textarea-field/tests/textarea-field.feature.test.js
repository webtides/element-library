/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import '../element';

describe('Feature | TextareaField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<textarea-field></textarea-field>`);
        await nextFrame();
    });
});


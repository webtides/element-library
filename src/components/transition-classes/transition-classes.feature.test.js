/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/transition-classes';
define();

describe('Feature | TransitionClasses', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<transition-classes></transition-classes>`);
        await nextFrame();
    });
});

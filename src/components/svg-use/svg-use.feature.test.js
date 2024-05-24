/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/svg-use';
define();

describe('Feature | SvgUse', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<svg-use></svg-use>`);
        await nextFrame();
    });
});

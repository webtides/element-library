/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/dropdown-element';
define();

describe('Feature | DropdownElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<dropdown-element></dropdown-element>`);
        await nextFrame();
    });
});


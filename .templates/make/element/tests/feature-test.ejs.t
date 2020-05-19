---
to: packages/<%= packageName %>/<%= elementName %>/tests/<%= elementName %>.feature.test.js
---
/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import '../element';

describe('Feature | <%= className %>', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<<%= elementName %>></<%= elementName %>>`);
        await nextFrame();
    });
});


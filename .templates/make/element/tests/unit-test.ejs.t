---
to: packages/<%= packageName %>/<%= elementName %>/tests/<%= elementName %>.unit.test.js
---
/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import <%= className %> from '../src/<%= elementName %>';

describe('Unit | <%= className %>', () => {
    it('can be created without errors', async () => {
        const el = new <%= className %>;
    });
});


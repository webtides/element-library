/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import DropdownElement, { define } from './dropdown-element.js';
define();

describe('Unit | DropdownElement', () => {
    it('can be created without errors', async () => {
        const el = new DropdownElement();
    });
});

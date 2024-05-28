/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import AmountField, { define } from './amount-field.js';
define();

describe('Unit | AmountField', () => {
    it('can be created without errors', async () => {
        const el = new AmountField();
    });
});

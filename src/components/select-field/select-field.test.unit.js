/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import SelectField, { define } from './select-field.js';
define();

describe('Unit | InputField', () => {
    it('can be created without errors', async () => {
        const el = new SelectField();
    });
});

/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import InputField, { define } from './input-field.js';
define();

describe('Unit | InputField', () => {
    it('can be created without errors', async () => {
        const el = new InputField();
    });
});

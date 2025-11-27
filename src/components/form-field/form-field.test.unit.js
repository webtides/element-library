/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import FormField, { define } from './form-field.js';
define();

describe('Unit | FormField', () => {
    it('can be created without errors', async () => {
        const el = new FormField();
    });
});

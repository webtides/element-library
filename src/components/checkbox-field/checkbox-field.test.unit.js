/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import CheckboxField, { define } from './checkbox-field.js';
define();

describe('Unit | CheckboxField', () => {
    it('can be created without errors', async () => {
        const el = new CheckboxField();
    });
});

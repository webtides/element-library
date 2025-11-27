/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import CheckboxField, { define } from './checkbox-field.js';
define();

describe('Unit | CheckboxField', () => {
    it('can be created without errors', async () => {
        const el = new CheckboxField();
    });
});

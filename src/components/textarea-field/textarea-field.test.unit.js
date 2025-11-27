/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import TextareaField, { define } from './textarea-field.js';
define();

describe('Unit | TextareaField', () => {
    it('can be created without errors', async () => {
        const el = new TextareaField();
    });
});

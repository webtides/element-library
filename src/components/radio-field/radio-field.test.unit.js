import { describe, it, expect } from 'vitest';
import RadioField, { define } from './radio-field.js';
define();

describe('Unit | RadioField', () => {
    it('can be created without errors', async () => {
        const el = new RadioField();
        expect(el).toBeInstanceOf(RadioField);
    });
});

import { describe, it, expect } from 'vitest';
import SwitchField, { define } from './switch-field.js';
define();

describe('Unit | SwitchField', () => {
    it('can be created without errors', async () => {
        const el = new SwitchField();
        expect(el).toBeInstanceOf(SwitchField);
    });
});

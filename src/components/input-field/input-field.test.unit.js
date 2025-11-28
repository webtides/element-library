import { describe, it } from 'vitest';
import InputField, { define } from './input-field.js';
define();

describe('Unit | InputField', () => {
    it('can be created without errors', async () => {
        const el = new InputField();
    });
});

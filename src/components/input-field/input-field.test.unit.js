import { describe, it } from 'vite-plus/test';
import InputField, { define } from './input-field.js';
define();

describe('Unit | InputField', () => {
    it('can be created without errors', async () => {
        const el = new InputField();
    });
});

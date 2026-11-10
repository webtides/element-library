import { describe, it } from 'vite-plus/test';
import FormField, { define } from './form-field.js';
define();

describe('Unit | FormField', () => {
    it('can be created without errors', async () => {
        const el = new FormField();
    });
});

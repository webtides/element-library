import { describe, it } from 'vite-plus/test';
import TextareaField, { define } from './textarea-field.js';
define();

describe('Unit | TextareaField', () => {
    it('can be created without errors', async () => {
        const el = new TextareaField();
    });
});

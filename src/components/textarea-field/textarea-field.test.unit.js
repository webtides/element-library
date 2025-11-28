import { describe, it } from 'vitest';
import TextareaField, { define } from './textarea-field.js';
define();

describe('Unit | TextareaField', () => {
    it('can be created without errors', async () => {
        const el = new TextareaField();
    });
});

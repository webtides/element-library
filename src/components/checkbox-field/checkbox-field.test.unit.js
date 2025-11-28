import { describe, it } from 'vitest';
import CheckboxField, { define } from './checkbox-field.js';
define();

describe('Unit | CheckboxField', () => {
    it('can be created without errors', async () => {
        const el = new CheckboxField();
    });
});

import { describe, it } from 'vite-plus/test';
import SelectField, { define } from './select-field.js';
define();

describe('Unit | SelectField', () => {
    it('can be created without errors', async () => {
        const el = new SelectField();
    });
});

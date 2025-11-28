import { describe, it } from 'vitest';
import AmountField, { define } from './amount-field.js';
define();

describe('Unit | AmountField', () => {
    it('can be created without errors', async () => {
        const el = new AmountField();
    });
});

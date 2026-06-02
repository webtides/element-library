import { describe, it, expect } from 'vitest';
import PasswordField, { define } from './password-field.js';
define();

describe('Unit | PasswordField', () => {
    it('can be created without errors', async () => {
        const el = new PasswordField();
        expect(el).toBeInstanceOf(PasswordField);
    });

    it('toggles passwordVisible and the rendered type', async () => {
        const el = new PasswordField();
        el.togglePasswordVisibility();
        expect(el.passwordVisible).toBe(true);
        expect(el.type).toBe('text');
        el.togglePasswordVisibility();
        expect(el.passwordVisible).toBe(false);
        expect(el.type).toBe('password');
    });
});

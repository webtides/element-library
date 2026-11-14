import { describe, it, expect } from 'vite-plus/test';
import CopyButton, { define, Events } from './copy-button.js';
define();

describe('Unit | CopyButton', () => {
    it('can be created without errors', async () => {
        const el = new CopyButton();
    });

    it('is a medium button named "Copy" that shows an outcome for a second and a half', async () => {
        const el = new CopyButton();
        expect(el.properties()).toEqual({
            value: '',
            from: '',
            disabled: false,
            size: 'medium',
            feedbackDuration: 1500,
            label: 'Copy',
            successLabel: 'Copied',
            errorLabel: 'Could not copy',
            status: 'idle',
        });
    });

    it('names its events after itself', async () => {
        expect(Events).toEqual({ COPY: 'copy-button-copy', ERROR: 'copy-button-error' });
    });
});

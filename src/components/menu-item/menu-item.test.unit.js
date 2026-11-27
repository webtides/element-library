import { describe, it, expect } from 'vite-plus/test';
import MenuItem, { define } from './menu-item.js';
define();

describe('Unit | MenuItem', () => {
    it('can be created without errors', async () => {
        const el = new MenuItem();
        expect(el).toBeInstanceOf(MenuItem);
    });

    it('is an action that can be chosen, without a value, by default', async () => {
        const el = new MenuItem();
        expect(el.properties()).toEqual({
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            value: '',
            disabled: false,
            type: 'normal',
            checked: false,
            variant: 'neutral',
        });
    });

    it('has the role of its type, and says its state for a type that has one', async () => {
        const markup = (properties) => {
            const el = new MenuItem();
            Object.assign(el, el.properties(), properties);
            return el.template().toString();
        };

        expect(markup({})).toContain('role="menuitem"');
        // The attribute is not written at all. Its name alone is in a comment of the template.
        expect(markup({})).not.toContain('aria-checked="');
        expect(markup({ checked: true })).not.toContain('aria-checked="');
        expect(markup({ type: 'checkbox' })).toContain('role="menuitemcheckbox"');
        expect(markup({ type: 'checkbox' })).toContain('aria-checked="false"');
        expect(markup({ type: 'radio', checked: true })).toContain('role="menuitemradio"');
        expect(markup({ type: 'radio', checked: true })).toContain('aria-checked="true"');
        // A type the entry does not know is an action.
        expect(markup({ type: 'switch', checked: true })).toContain('role="menuitem"');
    });
});

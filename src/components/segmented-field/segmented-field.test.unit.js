import { describe, it, expect } from 'vite-plus/test';
import SegmentedField, { define } from './segmented-field.js';
import RadioField from '../radio-field/radio-field.js';
define();

describe('Unit | SegmentedField', () => {
    it('can be created without errors', async () => {
        const el = new SegmentedField();
    });

    it('is a radio field with a size', async () => {
        const el = new SegmentedField();
        expect(el).toBeInstanceOf(RadioField);
        expect(el.properties()).toMatchObject({ options: [], size: 'medium', value: null, required: false });
    });
});

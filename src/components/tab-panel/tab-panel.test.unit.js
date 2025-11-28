import { describe, it } from 'vitest';
import TabPanel, { define } from './tab-panel.js';
define();

describe('Unit | TabPanel', () => {
    it('can be created without errors', async () => {
        const el = new TabPanel();
    });
});

/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import TabPanel, { define } from './tab-panel.js';
define();

describe('Unit | TabPanel', () => {
    it('can be created without errors', async () => {
        const el = new TabPanel();
    });
});

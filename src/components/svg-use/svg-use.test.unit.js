/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import SvgUse, { define } from './svg-use.js';
define();

describe('Unit | SvgUse', () => {
    it('can be created without errors', async () => {
        const el = new SvgUse();
    });
});

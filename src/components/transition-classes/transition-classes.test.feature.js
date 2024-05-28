/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './transition-classes.js';
define();

describe('Feature | TransitionClasses', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-transition-classes></el-transition-classes>`);
        await nextFrame();
    });
});

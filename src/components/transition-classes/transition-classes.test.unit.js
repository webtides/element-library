/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import TransitionClasses, { define } from './transition-classes.js';
define();

describe('Unit | TransitionClasses', () => {
    it('can be created without errors', async () => {
        const el = new TransitionClasses();
    });
});

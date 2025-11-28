import { describe, it } from 'vitest';
import TransitionClasses, { define } from './transition-classes.js';
define();

describe('Unit | TransitionClasses', () => {
    it('can be created without errors', async () => {
        const el = new TransitionClasses();
    });
});

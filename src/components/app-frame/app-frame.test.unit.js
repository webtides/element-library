import { describe, it, expect } from 'vite-plus/test';
import AppFrame, { define, Events } from './app-frame.js';
import { DEFAULT_STEP, STEPS } from './app-frame.style.js';
define();

describe('Unit | AppFrame', () => {
    it('can be created without errors', async () => {
        const el = new AppFrame();
    });

    it('has an English skip link, is wide from 48rem and has every region at every width by default', async () => {
        const el = new AppFrame();
        expect(el.properties()).toEqual({
            skipLabel: 'Skip to content',
            wideFrom: '48rem',
            narrowOnly: '',
            wideOnly: '',
            narrowNavigation: 'drawer',
            navigationOpen: false,
            navigationLabel: 'Navigation',
            closeLabel: 'Close',
        });
    });

    it('knows its default among the steps of its stylesheet', async () => {
        expect(STEPS).toEqual(['30rem', '40rem', '48rem', '64rem', '80rem']);
        expect(STEPS).toContain(DEFAULT_STEP);
    });

    it('names its event, and defines the drawer the navigation is in where it is narrow', async () => {
        expect(Events).toEqual({ NAVIGATION_TOGGLE: 'app-frame-navigation-toggle' });
        expect(customElements.get('el-drawer')).toBeDefined();
    });

    it('is not wide and has nothing that scrolls before it has rendered', async () => {
        const el = new AppFrame();
        expect(el.wide).toBe(false);
        expect(el.scroller).toBeUndefined();
    });
});

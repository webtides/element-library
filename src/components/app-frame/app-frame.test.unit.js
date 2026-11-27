import { describe, it, expect } from 'vite-plus/test';
import AppFrame, { define, Events } from './app-frame.js';
import { DEFAULT_STEP, STEPS } from './app-frame.style.js';
define();

describe('Unit | AppFrame', () => {
    it('can be created without errors', async () => {
        const el = new AppFrame();
    });

    it('has English texts, is wide from 48rem, has every region at every width and no edge to drag by default', async () => {
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
            resizable: '',
            navigationSize: 0,
            asideSize: 0,
            asideLabel: 'Aside',
            statusBarTap: false,
        });
    });

    it('knows its default among the steps of its stylesheet', async () => {
        expect(STEPS).toEqual(['30rem', '40rem', '48rem', '64rem', '80rem']);
        expect(STEPS).toContain(DEFAULT_STEP);
    });

    it('names its events, and defines the drawer of its navigation and the edges of its columns', async () => {
        expect(Events).toEqual({
            NAVIGATION_TOGGLE: 'app-frame-navigation-toggle',
            RESIZE: 'app-frame-resize',
            RESIZE_END: 'app-frame-resize-end',
            STATUS_BAR_TAP: 'app-frame-status-bar-tap',
        });
        expect(customElements.get('el-drawer')).toBeDefined();
        expect(customElements.get('el-splitter')).toBeDefined();
    });

    it('is not wide and has nothing that scrolls before it has rendered', async () => {
        const el = new AppFrame();
        expect(el.wide).toBe(false);
        expect(el.scroller).toBeUndefined();
    });
});

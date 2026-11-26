import { describe, it, expect } from 'vite-plus/test';
import { fixture, fixtureSync, nextFrame } from '../../test-helpers.js';
import { define } from './scroll-to-top.js';
define();

describe('Feature | ScrollToTop', () => {
    // These two come first: a test further down leaves an animation of the window running.
    it('scrolls the element around it that scrolls, and leaves the window where it is', async () => {
        fixtureSync(`<div style="height: 2000px">TEST</div>`);
        const box = await fixture(`
            <div style="height: 200px; overflow: auto">
                <div style="height: 1000px">Long</div>
                <el-scroll-to-top duration="1"><button>Scroll to top</button></el-scroll-to-top>
            </div>
        `);
        box.scrollTop = 500;
        window.scrollTo(0, 300);
        const scrollOfTheWindow = window.scrollY;
        expect(scrollOfTheWindow).not.toBe(0);

        box.querySelector('button').click();

        await expect.poll(() => box.scrollTop).toBe(0);
        expect(window.scrollY).toBe(scrollOfTheWindow);
        window.scrollTo(0, 0);
    });

    it('scrolls the window from inside an element that has an overflow but nothing to scroll', async () => {
        fixtureSync(`<div style="height: 2000px">TEST</div>`);
        const box = await fixture(`
            <div style="overflow: auto">
                <el-scroll-to-top duration="1"><button>Scroll to top</button></el-scroll-to-top>
            </div>
        `);
        window.scrollTo(0, document.body.scrollHeight);
        expect(window.scrollY).not.toBe(0);

        box.querySelector('button').click();

        await expect.poll(() => window.scrollY).toBe(0);
    });

    it('scrolls back to the top when a click event is fired inside the element', async () => {
        // make the body actually scrollable
        fixtureSync(`<div style="height: 2000px">TEST</div>`);

        const el = await fixture(
            `<el-scroll-to-top duration="1"><button ref="button">Scroll to top</button></el-scroll-to-top>`,
        );

        // scroll to bottom first
        window.scrollTo(0, document.body.scrollHeight);

        expect(document.documentElement.scrollTop || document.body.scrollTop).not.toBe(0);

        el.$refs.button.click();

        await nextFrame();

        expect(document.documentElement.scrollTop || document.body.scrollTop).toBe(0);
    });

    it('can change the scroll duration via attribute', async () => {
        // make the body actually scrollable
        fixtureSync(`<div style="height: 2000px">TEST</div>`);

        const el = await fixture(
            `<el-scroll-to-top duration="200"><button ref="button">Scroll to top</button></el-scroll-to-top>`,
        );

        // scroll to bottom first
        window.scrollTo(0, document.body.scrollHeight);

        expect(document.documentElement.scrollTop || document.body.scrollTop).not.toBe(0);

        el.$refs.button.click();

        await nextFrame();

        expect(document.documentElement.scrollTop || document.body.scrollTop).not.toBe(0);

        setTimeout(() => {
            expect(document.documentElement.scrollTop || document.body.scrollTop).toBe(0);
        }, 200);
    });

    it('prevents the default action by default', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<el-scroll-to-top duration="1">
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </el-scroll-to-top>`,
        );

        el.$refs.link.click();

        await nextFrame();

        expect(window.location.hash).toBe('');
    });

    it('can enable the default action by setting the prevent-default attribute to false', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<el-scroll-to-top duration="1" prevent-default="false">#
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </el-scroll-to-top>`,
        );

        el.$refs.link.click();

        await nextFrame();

        expect(window.location.hash).toBe('#some-anchor');
        window.location.hash = '';
    });
});

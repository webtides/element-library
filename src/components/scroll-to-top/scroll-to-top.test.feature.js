import { describe, it, expect } from 'vitest';
import { fixture, fixtureSync, nextFrame } from '../../test-helpers.js';
import { define } from './scroll-to-top.js';
define();

describe('Feature | ScrollToTop', () => {
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

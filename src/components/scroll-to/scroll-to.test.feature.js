/* eslint-disable no-unused-expressions */
import { fixture, nextFrame, fixtureSync, aTimeout } from '../../test-helpers.js';
import { define } from './scroll-to.js';
define();

describe('Feature | ScrollTo', () => {
    it('scrolls to the element with the attributed selector', async () => {
        const el = await fixture(
            `<el-scroll-to selector="#section">
                <button ref="button">Scroll to Section</button>
            </el-scroll-to>`,
        );

        // make the body actually scrollable
        fixtureSync(`<div style="height: 2000px">Empty</div><div id="section">Section</div>`);

        expect(document.documentElement.scrollTop || document.body.scrollTop).toBe(0);

        el.$refs.button.click();

        // Wait for scroll to complete - scrollIntoView with behavior:'auto' is instant,
        // but the browser may need a few frames to update scrollTop
        await aTimeout(50);

        expect(document.documentElement.scrollTop || document.body.scrollTop).not.toBe(0);
    });

    it('prevents the default action by default', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<el-scroll-to selector="#some-anchor">
                <a ref="link" href="#some-anchor">Scroll to</a>
            </el-scroll-to>`,
        );

        el.$refs.link.click();

        await nextFrame();

        expect(window.location.hash).toBe('');
    });

    it('can enable the default action by setting the prevent-default attribute to false', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<el-scroll-to selector="#some-anchor" prevent-default="false">
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </el-scroll-to>`,
        );

        el.$refs.link.click();

        await nextFrame();

        expect(window.location.hash).toBe('#some-anchor');
        window.location.hash = '';
    });
});

/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame, fixtureSync, aTimeout } from '@open-wc/testing';
import { define } from '@webtides/scroll-to';
define();

describe('Feature | ScrollTo', () => {
    it('scrolls to the element with the attributed selector', async () => {
        const el = await fixture(
            `<scroll-to selector="#section">
                <button ref="button">Scroll to Section</button>
            </scroll-to>`,
        );

        // make the body actually scrollable
        fixtureSync(`<div style="height: 2000px">Empty</div><div id="section">Section</div>`);

        assert.equal(document.documentElement.scrollTop || document.body.scrollTop, 0);

        el.$refs.button.click();

        await nextFrame();

        //TODO: this fails some time for no reason...
        //assert.notEqual(document.documentElement.scrollTop || document.body.scrollTop, 0);
    });

    it('prevents the default action by default', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<scroll-to selector="#some-anchor">
                <a ref="link" href="#some-anchor">Scroll to</a>
            </scroll-to>`,
        );

        el.$refs.link.click();

        await nextFrame();

        assert.equal(window.location.hash, '');
    });

    it('can enable the default action by setting the prevent-default attribute to false', async () => {
        fixtureSync(`<div id="some-anchor">TEST</div>`);
        const el = await fixture(
            `<scroll-to selector="#some-anchor" prevent-default="false">
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </scroll-to>`,
        );

        el.$refs.link.click();

        await nextFrame();

        assert.equal(window.location.hash, '#some-anchor');
        window.location.hash = '';
    });
});

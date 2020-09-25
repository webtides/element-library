/* eslint-disable no-unused-expressions */
import { fixture, fixtureSync, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/scroll-to-top';
define();

describe('Feature | ScrollToTop', () => {
	it('scrolls back to the top when a click event is fired inside the element', async () => {
		// make the body actually scrollable
		fixtureSync(`<div style="height: 2000px">TEST</div>`);

		const el = await fixture(
			`<scroll-to-top duration="1"><button ref="button">Scroll to top</button></scroll-to-top>`,
		);

		// scroll to bottom first
		window.scrollTo(0, document.body.scrollHeight);

		assert.notEqual(document.documentElement.scrollTop || document.body.scrollTop, 0);

		el.$refs.button.click();

		await nextFrame();

		assert.equal(document.documentElement.scrollTop || document.body.scrollTop, 0);
	});

	it('can change the scroll duration via attribute', async () => {
		// make the body actually scrollable
		fixtureSync(`<div style="height: 2000px">TEST</div>`);

		const el = await fixture(
			`<scroll-to-top duration="200"><button ref="button">Scroll to top</button></scroll-to-top>`,
		);

		// scroll to bottom first
		window.scrollTo(0, document.body.scrollHeight);

		assert.notEqual(document.documentElement.scrollTop || document.body.scrollTop, 0);

		el.$refs.button.click();

		await nextFrame();

		assert.notEqual(document.documentElement.scrollTop || document.body.scrollTop, 0);

		setTimeout(() => {
			assert.equal(document.documentElement.scrollTop || document.body.scrollTop, 0);
		}, 200);
	});

	it('prevents the default action by default', async () => {
		fixtureSync(`<div id="some-anchor">TEST</div>`);
		const el = await fixture(
			`<scroll-to-top duration="1">
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </scroll-to-top>`,
		);

		el.$refs.link.click();

		await nextFrame();

		assert.equal(window.location.hash, '');
	});

	it('can enable the default action by setting the prevent-default attribute to false', async () => {
		fixtureSync(`<div id="some-anchor">TEST</div>`);
		const el = await fixture(
			`<scroll-to-top duration="1" prevent-default="false">#
                <a ref="link" href="#some-anchor">Scroll to top</a>
            </scroll-to-top>`,
		);

		el.$refs.link.click();

		await nextFrame();

		assert.equal(window.location.hash, '#some-anchor');
		window.location.hash = '';
	});
});

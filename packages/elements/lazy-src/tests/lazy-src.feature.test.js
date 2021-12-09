/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define, Events } from '@webtides/lazy-src';
define();

const transparentPngPixel =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Feature | LazySrc', () => {
	it('copies the data-src attribute to src attribute on the first child element', async () => {
		const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

		await nextFrame();

		assert.equal(el.$refs.image.src, transparentPngPixel);
	});

	it('prevents loading src resources if the element never becomes visible', async () => {
		const el = await fixture(`
            <lazy-src style="display: none">
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

		await nextFrame();

		assert.equal(el.$refs.image.src, '');
	});

	it('sets the loaded property/attribute to true when the element was loaded', async () => {
		const el = await fixture(`
            <lazy-src loaded="false">
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

		assert.equal(el.loaded, false);

		await oneEvent(el, Events.LOAD);
		await nextFrame();

		assert.equal(el.loaded, true);
		assert.equal(el.getAttribute('loaded'), 'true');
	});

	it("dispatches a 'Events.LOAD' event when the element was loaded", async () => {
		const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

		const event = await oneEvent(el, Events.LOAD);

		assert.deepEqual(event.type, Events.LOAD);
	});

	it('lazy loads img elements', async () => {
		const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

		await nextFrame();

		assert.equal(el.$refs.image.src, transparentPngPixel);
	});

	it('getter returns api', async () => {
		const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);
		await nextFrame();
		const api = el.api;
		assert.ok(api);
	});

	it('lazy loads picture elements by adding an img element to the picture', async () => {
		const el = await fixture(`
            <lazy-src>
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </lazy-src>
        `);

		let img = el.querySelector('img');

		assert.equal(img, undefined);

		await nextFrame();

		img = el.querySelector('img');

		assert.notEqual(img, undefined);
	});

	it('ads imgClass to generated img element in picture after load', async () => {
		const el = await fixture(`
            <lazy-src img-class="lazy">
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </lazy-src>
        `);

		let img = el.querySelector('img');

		assert.equal(img, undefined);

		await nextFrame();

		img = el.querySelector('img');

		assert.ok(img.classList.contains('lazy'));
	});

	it("dispatches a 'Events.IMG_LOAD' event when the image within a picture was actually loaded", async () => {
		const el = await fixture(`
           	<lazy-src>
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </lazy-src>
        `);

		const event = await oneEvent(el, Events.IMG_LOAD);

		assert.deepEqual(event.type, Events.IMG_LOAD);
	});

	it("dispatches a 'Events.IMG_ERROR' event when the image within a picture could not be loaded", async () => {
		const el = await fixture(`
           	<lazy-src>
                <picture>
                    <source srcset="broken" media="(min-width: 320px)">
                </picture>
            </lazy-src>
        `);

		const event = await oneEvent(el, Events.IMG_ERROR);
		assert.deepEqual(event.type, Events.IMG_ERROR);
	});
});

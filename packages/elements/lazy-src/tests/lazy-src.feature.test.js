/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import '../element';

const transparentPngPixel =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Feature | LazySrc', () => {
    it('copies the data-src attribute to src attribute on the first child element', async () => {
        const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

        assert.equal(el.$refs.image.src, '');

        await nextFrame();

        assert.equal(el.$refs.image.src, transparentPngPixel);
    });

    it('prevents loading src resources if the element never becomes visible', async () => {
        const el = await fixture(`
            <lazy-src style="display: none">
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

        assert.equal(el.$refs.image.src, '');

        await nextFrame();

        assert.equal(el.$refs.image.src, '');
    });

    it('sets the loaded property/attribute to true when the element was loaded', async () => {
        const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

        assert.equal(el.loaded, false);

        await nextFrame();

        assert.equal(el.loaded, true);
        assert.equal(el.getAttribute('loaded'), 'true');
    });

    it("dispatches a 'src-loaded' event when the element was loaded", async () => {
        const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

        const event = await oneEvent(el, 'src-loaded');

        assert.deepEqual(event.detail, {});
    });

    it('lazy loads img elements', async () => {
        const el = await fixture(`
            <lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </lazy-src>
        `);

        assert.equal(el.$refs.image.src, '');

        await nextFrame();

        assert.equal(el.$refs.image.src, transparentPngPixel);
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
});

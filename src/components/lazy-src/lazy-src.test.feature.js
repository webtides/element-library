import { describe, it, expect } from 'vitest';
import { fixture, fixtureSync, nextFrame, oneEvent } from '../../test-helpers.js';
import { define, Events } from './lazy-src.js';
define();

const transparentPngPixel =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Feature | LazySrc', () => {
    it('copies the data-src attribute to src attribute on the first child element', async () => {
        const el = await fixture(`
            <el-lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);

        await nextFrame();

        expect(el.$refs.image.src).toBe(transparentPngPixel);
    });

    it('prevents loading src resources if the element never becomes visible', async () => {
        const el = await fixture(`
            <el-lazy-src style="display: none">
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);

        await nextFrame();

        expect(el.$refs.image.src).toBe('');
    });

    it('sets the loaded property/attribute to true when the element was loaded', async () => {
        const el = fixtureSync(`
            <el-lazy-src loaded="false">
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);

        expect(el.loaded).toBe(false);

        await oneEvent(el, Events.LOAD);
        await nextFrame();

        expect(el.loaded).toBe(true);
        expect(el.getAttribute('loaded')).toBe('true');
    });

    it("dispatches a 'Events.LOAD' event when the element was loaded", async () => {
        const el = fixtureSync(`
            <el-lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);

        const event = await oneEvent(el, Events.LOAD);

        expect(event.type).toEqual(Events.LOAD);
    });

    it('lazy loads img elements', async () => {
        const el = await fixture(`
            <el-lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);

        await nextFrame();

        expect(el.$refs.image.src).toBe(transparentPngPixel);
    });

    it('getter returns api', async () => {
        const el = await fixture(`
            <el-lazy-src>
                <img ref="image" data-src="${transparentPngPixel}"/>
            </el-lazy-src>
        `);
        await nextFrame();
        const api = el.api;
        expect(api).toBeTruthy();
    });

    it('lazy loads picture elements by adding an img element to the picture', async () => {
        const el = fixtureSync(`
            <el-lazy-src>
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </el-lazy-src>
        `);

        let img = el.querySelector('img');

        expect(img).toBeNull();

        await oneEvent(el, Events.LOAD);

        img = el.querySelector('img');

        expect(img).not.toBeNull();
    });

    it('ads imgClass to generated img element in picture after load', async () => {
        const el = fixtureSync(`
            <el-lazy-src img-class="lazy">
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </el-lazy-src>
        `);

        let img = el.querySelector('img');

        expect(img).toBeNull();

        await oneEvent(el, Events.LOAD);

        img = el.querySelector('img');

        expect(img.classList.contains('lazy')).toBeTruthy();
    });

    it("dispatches a 'Events.IMG_LOAD' event when the image within a picture was actually loaded", async () => {
        const el = fixtureSync(`
           	<el-lazy-src>
                <picture>
                    <source srcset="${transparentPngPixel}" media="(min-width: 1280px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 980px)">
                    <source srcset="${transparentPngPixel}" media="(min-width: 320px)">
                </picture>
            </el-lazy-src>
        `);

        const event = await oneEvent(el, Events.IMG_LOAD);

        expect(event.type).toEqual(Events.IMG_LOAD);
    });

    // it("dispatches a 'Events.IMG_ERROR' event when the image within a picture could not be loaded", async () => {
    //     const el = await fixture(`
    //        	<el-lazy-src>
    //             <picture>
    //                 <source srcset="broken" media="(min-width: 320px)">
    //             </picture>
    //         </el-lazy-src>
    //     `);
    //
    //     const event = await oneEvent(el, Events.IMG_ERROR);
    //     expect(event.type).toEqual(Events.IMG_ERROR);
    // });
});

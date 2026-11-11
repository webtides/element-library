import { afterAll, beforeAll, describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './carousel.js';
define();

const carouselFixture = async () => {
    const wrapper = await fixture(`
        <div style="--el-touch-target: 44px; width: 320px">
            <el-carousel>
                <div style="height: 160px">1</div>
                <div style="height: 160px">2</div>
                <div style="height: 160px">3</div>
            </el-carousel>
        </div>
    `);
    await nextFrame();
    return wrapper.querySelector('el-carousel');
};

describe('Feature | Carousel', () => {
    it('can connect without errors', async () => {
        await fixture(`<el-carousel></el-carousel>`);
        await nextFrame();
    });

    it('names its arrows when their slots are empty', async () => {
        const el = await carouselFixture();
        const [previous, next] = el.shadowRoot.querySelectorAll('[part~="arrow"]');

        expect(previous.textContent.trim()).toBe('Previous slide');
        expect(next.textContent.trim()).toBe('Next slide');
        // The names are for screen readers only.
        expect(sizeOf(previous.querySelector('.visually-hidden'))).toEqual({ width: 1, height: 1 });
        const results = await axe.run(el, { runOnly: ['button-name'] });
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('leaves the name of an arrow to what is in its slot', async () => {
        const wrapper = await fixture(`
            <div style="width: 320px">
                <el-carousel>
                    <div>1</div>
                    <div>2</div>
                    <span slot="arrow-left">Zurück</span>
                    <span slot="arrow-right">Weiter</span>
                </el-carousel>
            </div>
        `);
        await nextFrame();
        const slots = wrapper.querySelector('el-carousel').shadowRoot.querySelectorAll('[part~="arrow"] slot');

        expect([...slots].map((slot) => slot.assignedNodes({ flatten: true })[0].textContent)).toEqual([
            'Zurück',
            'Weiter',
        ]);
    });

    describe('the clones for looping', () => {
        // A style sheet of the page. element-js hands the sheets of the document to a shadow root.
        const pageStyle = document.createElement('style');
        pageStyle.textContent = '.loop-slide { height: 60px }';
        beforeAll(() => document.head.append(pageStyle));
        afterAll(() => pageStyle.remove());

        const loopFixture = async () => {
            const wrapper = await fixture(`
                <div style="width: 320px">
                    <el-carousel>
                        <div class="loop-slide">1</div>
                        <div class="loop-slide">2</div>
                        <div class="loop-slide">3</div>
                        <div class="loop-slide">4</div>
                        <span slot="arrow-left">Back</span>
                    </el-carousel>
                </div>
            `);
            await nextFrame();
            return wrapper.querySelector('el-carousel');
        };
        const track = (el) => el.shadowRoot.querySelector('[part="slides"]');
        const clones = (el) => [...track(el).querySelectorAll('.glide__slide--clone')];
        // What renders in the track, in order: the clones around the slides of the page.
        const rendered = (el) =>
            [...track(el).children]
                .flatMap((child) => (child.localName === 'slot' ? child.assignedElements() : [child]))
                .map((node) => node.textContent + (node.matches('.glide__slide--clone') ? ' clone' : ''));

        it('leaves the children of the element as the page wrote them', async () => {
            const wrapper = await fixture(`
                <div style="width: 320px">
                    <div class="before-start">
                        <div>1</div>
                        <div>2</div>
                        <div>3</div>
                        <div>4</div>
                        <span slot="arrow-left">Back</span>
                    </div>
                </div>
            `);
            const written = [...wrapper.querySelector('.before-start').children];
            const el = document.createElement('el-carousel');
            el.append(...written);
            wrapper.querySelector('.before-start').replaceWith(el);
            await nextFrame();
            await nextFrame();

            expect(clones(el)).toHaveLength(4);
            expect([...el.children]).toEqual(written);
            expect(el.querySelector('.glide__slide--clone')).toBeNull();
        });

        it('renders them around the slides, inside the shadow root', async () => {
            const el = await loopFixture();

            expect(rendered(el)).toEqual(['3 clone', '4 clone', '1', '2', '3', '4', '1 clone', '2 clone']);
        });

        it('loops from the first slide back to the last and on to the first', async () => {
            const el = await loopFixture();

            el.prev();
            expect(el.api.index).toBe(3);
            // Glide takes no further step while it is moving.
            await aTimeout(500);
            el.next();
            expect(el.api.index).toBe(0);
        });

        it('styles a clone by the class of its slide', async () => {
            const el = await loopFixture();

            expect(sizeOf(clones(el)[0]).height).toBe(60);
            expect(sizeOf(el.children[0]).height).toBe(60);
        });

        it('puts the gaps on slides and clones, not on what is in the slot of an arrow', async () => {
            const el = await loopFixture();
            await aTimeout(50);

            expect(el.children[0].style.marginLeft).toBe('5px');
            expect(clones(el)[1].style.marginLeft).toBe('5px');
            expect(el.querySelector('[slot="arrow-left"]').getAttribute('style')).toBeNull();
        });

        it('keeps the slides when Glide is updated', async () => {
            const el = await loopFixture();

            el.api.update({ gap: 20 });
            await aTimeout(50);

            expect(rendered(el)).toEqual(['3 clone', '4 clone', '1', '2', '3', '4', '1 clone', '2 clone']);
            expect(el.children).toHaveLength(5);
        });

        it('removes them when the carousel is disabled', async () => {
            const el = await loopFixture();

            el.disabled = true;
            await el.requestUpdate();

            expect(el.shadowRoot.querySelector('.glide__slide--clone')).toBeNull();
            expect(el.children).toHaveLength(5);
        });
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const el = await carouselFixture();
        expect(sizeOf(el.shadowRoot.querySelector('[part~="arrow"]')).height).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the arrows at least --el-touch-target in both directions', async () => {
            const el = await carouselFixture();
            const arrows = el.shadowRoot.querySelectorAll('[part~="arrow"]');
            expect(arrows.length).toBe(2);
            for (const arrow of arrows) {
                const { width, height } = sizeOf(arrow);
                expect(Math.min(width, height), arrow.getAttribute('part')).toBeGreaterThanOrEqual(44);
            }
        });

        it('gives every bullet a hit area of --el-touch-target that no other bullet covers', async () => {
            const el = await carouselFixture();
            const bullets = [...el.shadowRoot.querySelectorAll('[part~="dot"]')];
            expect(bullets.length).toBe(3);

            for (const bullet of bullets) {
                // The dot itself keeps its size.
                expect(sizeOf(bullet)).toEqual({ width: 13, height: 13 });

                bullet.scrollIntoView({ block: 'center' });
                const { left, top, width, height } = bullet.getBoundingClientRect();
                const center = { x: left + width / 2, y: top + height / 2 };
                // 21 px from the center in every direction is still this bullet: 2 × 21 < 44.
                for (const [dx, dy] of [
                    [-21, 0],
                    [21, 0],
                    [0, -21],
                    [0, 21],
                ]) {
                    expect(el.shadowRoot.elementFromPoint(center.x + dx, center.y + dy)).toBe(bullet);
                }
            }
        });

        it('goes to the slide of a bullet that is tapped beside its dot', async () => {
            const el = await carouselFixture();
            const bullets = [...el.shadowRoot.querySelectorAll('[part~="dot"]')];
            const last = bullets.at(-1);
            last.scrollIntoView({ block: 'center' });
            const { left, top, width, height } = last.getBoundingClientRect();

            const target = el.shadowRoot.elementFromPoint(left + width / 2 + 18, top + height / 2 - 18);
            target.click();
            await aTimeout(50);

            expect(last.part.contains('selected-dot')).toBe(true);
        });
    });
});

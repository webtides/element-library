import { describe, it, expect } from 'vite-plus/test';
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

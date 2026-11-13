import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useReducedMotion } from '../../test-helpers.js';
import { define } from './skeleton.js';
import { define as defineCard } from '../card/card.js';
define();
defineCard();

const base = (el) => el.shadowRoot.querySelector('[part~="base"]');
const animation = (el) => getComputedStyle(base(el)).animationName;
// A place of 300px with text of 20px, in blue.
const place = `width: 300px; font: 20px/30px sans-serif; color: rgb(0, 0, 255);`;
const placed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};
// An eighth of a colour, as the browser reports the mix.
const eighth = (red, green, blue) => `color(srgb ${red} ${green} ${blue} / 0.12)`;

describe('Feature | Skeleton', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-skeleton></el-skeleton>`);
        await nextFrame();
    });

    it('is a shape, and nothing for assistive technology', async () => {
        const el = await fixture(`<el-skeleton></el-skeleton>`);

        expect(el.hasAttribute('role')).toBe(false);
        expect(base(el).hasAttribute('role')).toBe(false);
        expect(el.shadowRoot.textContent.trim()).toBe('');
        // It holds no content: there is no slot.
        expect(el.shadowRoot.querySelector('slot')).toBe(null);
    });

    describe('size and shape', () => {
        it('is a line by default: as wide as its container, as high as the text', async () => {
            const el = await placed(`<el-skeleton></el-skeleton>`);

            expect(sizeOf(el)).toEqual({ width: 300, height: 20 });
            expect(sizeOf(base(el))).toEqual({ width: 300, height: 20 });
        });

        it('takes the width and the height it is given', async () => {
            const [short, square, picture] = await placed(`
                <el-skeleton style="width: 60%"></el-skeleton>
                <el-skeleton style="width: 48px; height: 48px"></el-skeleton>
                <el-skeleton style="height: auto; aspect-ratio: 3 / 2"></el-skeleton>
            `);

            expect(sizeOf(base(short))).toEqual({ width: 180, height: 20 });
            expect(sizeOf(base(square))).toEqual({ width: 48, height: 48 });
            expect(sizeOf(base(picture))).toEqual({ width: 300, height: 200 });
        });

        it('keeps its shape where a rule from outside changes the display of the host', async () => {
            // The media region of a card makes what is slotted into it a block of its own width.
            const [card, inline] = await placed(`
                <el-card><el-skeleton slot="media" style="height: auto; aspect-ratio: 3 / 1"></el-skeleton>Body</el-card>
                <el-skeleton style="display: inline-block; width: 90px; height: 30px"></el-skeleton>
            `);
            const media = card.querySelector('el-skeleton');

            expect(sizeOf(media)).toEqual({ width: 300, height: 100 });
            expect(sizeOf(base(media))).toEqual({ width: 300, height: 100 });
            expect(sizeOf(base(inline))).toEqual({ width: 90, height: 30 });
        });

        it('has the radius of the theme, and the one of --el-skeleton-radius before that', async () => {
            const [plain, themed, circle] = await placed(`
                <el-skeleton></el-skeleton>
                <el-skeleton style="--el-radius-md: 10px"></el-skeleton>
                <el-skeleton style="--el-radius-md: 10px; --el-skeleton-radius: 50%"></el-skeleton>
            `);

            expect(getComputedStyle(base(plain)).borderRadius).toBe('4px');
            expect(getComputedStyle(base(themed)).borderRadius).toBe('10px');
            expect(getComputedStyle(base(circle)).borderRadius).toBe('50%');
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-skeleton hidden></el-skeleton>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('colour', () => {
        it('is an eighth of the text colour of the page without a theme', async () => {
            const el = await placed(`<el-skeleton></el-skeleton>`);
            expect(getComputedStyle(base(el)).backgroundColor).toBe(eighth(0, 0, 1));
        });

        it('is an eighth of the text colour of the theme', async () => {
            const el = await placed(`<el-skeleton></el-skeleton>`, '--el-color-fg: rgb(255, 0, 0);');
            expect(getComputedStyle(base(el)).backgroundColor).toBe(eighth(1, 0, 0));
        });

        it('takes its colour from --el-skeleton-color', async () => {
            const el = await placed(
                `<el-skeleton style="--el-skeleton-color: rgb(1, 2, 3)"></el-skeleton>`,
                '--el-color-fg: rgb(255, 0, 0);',
            );
            expect(getComputedStyle(base(el)).backgroundColor).toBe('rgb(1, 2, 3)');
        });
    });

    describe('effect', () => {
        it('stands still by default, and says so on the host', async () => {
            const el = await placed(`<el-skeleton></el-skeleton>`);

            expect(el.effect).toBe('none');
            expect(el.getAttribute('effect')).toBe('none');
            expect(animation(el)).toBe('none');
            expect(getComputedStyle(base(el)).backgroundImage).toBe('none');
        });

        it('lets a lighter band pass over the shape as sheen', async () => {
            const el = await placed(`<el-skeleton effect="sheen"></el-skeleton>`);
            const style = getComputedStyle(base(el));

            expect(style.animationName).toBe('el-skeleton-sheen');
            // Every two seconds, for as long as the wait takes.
            expect(style.animationDuration).toBe('2s');
            expect(style.animationIterationCount).toBe('infinite');
            expect(base(el).getAnimations()[0].playState).toBe('running');
            // The colour of the shape, a third of it in the middle, the colour of the shape again.
            expect(style.backgroundImage).toBe(
                `linear-gradient(90deg, ${eighth(0, 0, 1)} 40%, color(srgb 0 0 1 / 0.04) 50%, ${eighth(0, 0, 1)} 60%)`,
            );
        });

        it('shows the plain colour at both ends of the way of the band, so the loop has no jump', async () => {
            const el = await placed(`<el-skeleton effect="sheen"></el-skeleton>`);
            const keyframes = base(el).getAnimations()[0].effect.getKeyframes();

            // The gradient is three times as wide as the shape. At 100% the shape shows its last
            // third and at 0 its first: the band, from 40% to 60%, is in neither.
            expect(getComputedStyle(base(el)).backgroundSize).toBe('300% 100%');
            expect(keyframes.map((keyframe) => keyframe.backgroundPositionX)).toEqual(['100%', '0px']);
        });

        it('takes the colour of the band from --el-skeleton-sheen-color', async () => {
            const el = await placed(
                `<el-skeleton effect="sheen" style="--el-skeleton-color: rgb(1, 2, 3); --el-skeleton-sheen-color: rgb(4, 5, 6)"></el-skeleton>`,
            );
            expect(getComputedStyle(base(el)).backgroundImage).toBe(
                'linear-gradient(90deg, rgb(1, 2, 3) 40%, rgb(4, 5, 6) 50%, rgb(1, 2, 3) 60%)',
            );
        });

        it('fades and comes back as pulse', async () => {
            const el = await placed(`<el-skeleton effect="pulse"></el-skeleton>`);
            const [running] = base(el).getAnimations();

            expect(animation(el)).toBe('el-skeleton-pulse');
            expect(running.playState).toBe('running');
            expect(getComputedStyle(base(el)).animationDuration).toBe('2s');
            expect(getComputedStyle(base(el)).animationIterationCount).toBe('infinite');
            expect(running.effect.getKeyframes().map((keyframe) => keyframe.opacity)).toEqual(['1', '0.4', '1']);
            // The colour stays the plain one.
            expect(getComputedStyle(base(el)).backgroundColor).toBe(eighth(0, 0, 1));
        });

        it('takes an effect set from a script', async () => {
            const el = await placed(`<el-skeleton></el-skeleton>`);

            el.effect = 'pulse';
            await nextFrame();
            expect(el.getAttribute('effect')).toBe('pulse');
            expect(animation(el)).toBe('el-skeleton-pulse');

            el.effect = 'none';
            await nextFrame();
            expect(animation(el)).toBe('none');
        });

        it('stands still with an effect it does not know', async () => {
            const el = await placed(`<el-skeleton effect="wave"></el-skeleton>`);
            expect(animation(el)).toBe('none');
        });

        describe('for a user who prefers reduced motion', () => {
            useReducedMotion();

            it('stands still', async () => {
                const [sheen, pulse] = await placed(`
                    <el-skeleton effect="sheen"></el-skeleton>
                    <el-skeleton effect="pulse"></el-skeleton>
                `);

                expect(animation(sheen)).toBe('none');
                expect(animation(pulse)).toBe('none');
                expect(getComputedStyle(base(pulse)).opacity).toBe('1');
            });
        });
    });

    it('has no detectable a11y violations in a region that is busy', async () => {
        const wrapper = await fixture(`
            <div style="${place} background: rgb(255, 255, 255)">
                <section aria-label="Members" aria-busy="true">
                    <el-skeleton effect="sheen" style="width: 40%"></el-skeleton>
                    <el-skeleton effect="sheen"></el-skeleton>
                </section>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('has its shape in the server-rendered markup', async () => {
        const el = await fixture(`<el-skeleton effect="sheen"></el-skeleton>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        expect(el.template().toString()).toMatch(/<span part="base" class="skeleton"><\/span>/);
    });
});

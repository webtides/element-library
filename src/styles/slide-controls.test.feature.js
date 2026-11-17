import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { fixture, nextFrame, sizeOf, useForcedColors } from '../test-helpers.js';
import { define as defineCarousel } from '../components/carousel/carousel.js';
import { define as defineSlider } from '../components/slider/slider.js';

defineCarousel();
defineSlider();

// The tokens of a theme, with values no fallback has.
const THEME = `
    --el-color-bg: rgb(250, 250, 250);
    --el-color-fg: rgb(10, 10, 10);
    --el-color-fg-muted: rgb(90, 90, 90);
    --el-color-border: rgb(120, 120, 120);
    --el-color-accent: rgb(0, 80, 200);
    --el-color-focus-ring: rgb(200, 0, 100);
    --el-radius-md: 7px;
    --el-border-width: 2px;
    --el-control-height: 48px;
    --el-space-2: 12px;
    --el-focus-ring-width: 3px;
    --el-focus-ring-offset: 1px;
`;
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/**
 * A carousel and a slider with three slides each, the two components that compose the module.
 * @param {string} [style] - Inline style of the element around the two, the tokens of a theme.
 * @returns {Promise<[HTMLElement, HTMLElement, HTMLElement]>} The carousel, the slider, and a button in front of them.
 */
const bothFixture = async (style = '') => {
    const wrapper = await fixture(`
        <div style="width: 480px; color: rgb(40, 50, 60); ${style}">
            <button>Before</button>
            <el-carousel>
                <div style="height: 120px">1</div>
                <div style="height: 120px">2</div>
                <div style="height: 120px">3</div>
            </el-carousel>
            <el-slider>
                <div class="item" style="height: 120px">1</div>
                <div class="item" style="height: 120px">2</div>
                <div class="item" style="height: 120px">3</div>
            </el-slider>
        </div>
    `);
    await nextFrame();
    await nextFrame();
    return [wrapper.querySelector('el-carousel'), wrapper.querySelector('el-slider'), wrapper.querySelector('button')];
};

const controlsOf = (el) => {
    const root = el.shadowRoot;
    return {
        track: root.querySelector('[part~="track"], [part~="scroller"]'),
        arrows: [...root.querySelectorAll('[part~="arrow"]')],
        row: root.querySelector('[part~="dots"]'),
        dots: [...root.querySelectorAll('[part~="dot"]')],
        selected: root.querySelector('[part~="selected-dot"]'),
        idle: root.querySelector('[part~="dot"]:not([part~="selected-dot"])'),
    };
};

const LOOK = [
    'width',
    'height',
    'backgroundColor',
    'color',
    'borderTopStyle',
    'borderTopWidth',
    'borderTopColor',
    'borderTopLeftRadius',
    'fontSize',
    'cursor',
    'opacity',
];
const lookOf = (element) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(LOOK.map((property) => [property, style[property]]));
};
const ringOf = (element) => {
    const style = getComputedStyle(element);
    return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
};
const centerOf = (element) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
};

/** The element that has the focus, through every shadow root. */
const focused = () => {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active;
};

/** Moves the keyboard focus from the button in front of the two to an element, with the Tab key. */
const tabTo = async (before, target) => {
    before.focus();
    for (let presses = 0; presses < 20; presses++) {
        await userEvent.tab();
        if (focused() === target) return;
    }
    throw new Error('tabTo: the Tab key does not reach the element');
};

describe('Feature | Styles | slide-controls', () => {
    describe('the look', () => {
        for (const [name, style] of [
            ['without a theme', ''],
            ['with the tokens of a theme', THEME],
        ]) {
            it(`is the same in the carousel and in the slider, ${name}`, async () => {
                const [carousel, slider] = await bothFixture(style);
                const one = controlsOf(carousel);
                const other = controlsOf(slider);

                // The arrow forward: the one back is disabled in a slider at its start.
                expect(lookOf(one.arrows[1])).toEqual(lookOf(other.arrows[1]));
                expect(lookOf(one.idle)).toEqual(lookOf(other.idle));
                expect(lookOf(one.selected)).toEqual(lookOf(other.selected));
            });
        }

        it('reads the colours, the border, the radius and the size of an arrow from the tokens', async () => {
            const [carousel, slider] = await bothFixture(THEME);

            for (const el of [carousel, slider]) {
                expect(lookOf(controlsOf(el).arrows[1]), el.localName).toMatchObject({
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgb(250, 250, 250)',
                    color: 'rgb(10, 10, 10)',
                    borderTopWidth: '2px',
                    borderTopColor: 'rgb(120, 120, 120)',
                    borderTopLeftRadius: '7px',
                });
            }
        });

        it('gives an arrow the surface and the text colour of the browser without a theme', async () => {
            const [carousel, slider] = await bothFixture();
            const probe = await fixture(`<span style="background: Canvas; color: CanvasText">probe</span>`);
            const { backgroundColor, color } = getComputedStyle(probe);
            expect(backgroundColor).not.toBe(TRANSPARENT);

            for (const el of [carousel, slider]) {
                expect(lookOf(controlsOf(el).arrows[1]), el.localName).toMatchObject({
                    width: '40px',
                    height: '40px',
                    backgroundColor,
                    color,
                });
            }
        });

        it('shows an arrow head in an arrow whose slot is empty', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                for (const arrow of controlsOf(el).arrows) {
                    const head = arrow.querySelector('slot > svg');
                    expect(head.getAttribute('aria-hidden'), el.localName).toBe('true');
                    expect(sizeOf(head), el.localName).toEqual({ width: 20, height: 20 });
                }
            }
        });

        it('draws a dot as a ring and the selected one as a disc, in the colours of the tokens', async () => {
            const [carousel, slider] = await bothFixture(THEME);

            for (const el of [carousel, slider]) {
                const { idle, selected } = controlsOf(el);
                expect(lookOf(idle), el.localName).toMatchObject({
                    width: '10px',
                    height: '10px',
                    backgroundColor: TRANSPARENT,
                    borderTopWidth: '2px',
                    borderTopColor: 'rgb(90, 90, 90)',
                    borderTopLeftRadius: '50%',
                });
                // A border of half the size on every side leaves no hole.
                expect(lookOf(selected), el.localName).toMatchObject({
                    width: '10px',
                    height: '10px',
                    borderTopWidth: '5px',
                    borderTopColor: 'rgb(0, 80, 200)',
                });
            }
        });

        it('draws the dots in the text colour of the page without a theme', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                const { idle, selected } = controlsOf(el);
                expect(lookOf(idle).borderTopColor, el.localName).toBe('rgb(40, 50, 60)');
                expect(lookOf(selected).borderTopColor, el.localName).toBe('rgb(40, 50, 60)');
                // The two still differ: a ring and a disc.
                expect(lookOf(idle).borderTopWidth, el.localName).toBe('2px');
                expect(lookOf(selected).borderTopWidth, el.localName).toBe('5px');
            }
        });

        it('fades the sign of an arrow that leads nowhere, and keeps its surface', async () => {
            const [carousel, slider] = await bothFixture(THEME);
            // A slider at its start, and a carousel that does not loop at its first slide.
            carousel.options = { type: 'slider', rewind: false };
            await carousel.requestUpdate();
            await nextFrame();
            await nextFrame();
            expect(controlsOf(carousel).arrows[0].classList.contains('glide__arrow--disabled')).toBe(true);
            expect(controlsOf(slider).arrows[0].disabled).toBe(true);

            for (const el of [carousel, slider]) {
                const [first, second] = controlsOf(el).arrows;
                // The text colour of the theme at 40 %. The slide does not show through the arrow.
                expect(lookOf(first), el.localName).toMatchObject({
                    color: 'color(srgb 0.0392157 0.0392157 0.0392157 / 0.4)',
                    backgroundColor: 'rgb(250, 250, 250)',
                    opacity: '1',
                    cursor: 'not-allowed',
                });
                expect(lookOf(second), el.localName).toMatchObject({ color: 'rgb(10, 10, 10)', cursor: 'pointer' });
            }
        });
    });

    describe('the place', () => {
        it('has the dots in a row under the track, in the middle of the component', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                const { track, row, dots } = controlsOf(el);
                const host = el.getBoundingClientRect();
                const rowBox = row.getBoundingClientRect();
                expect(dots, el.localName).toHaveLength(3);
                expect(rowBox.top, el.localName).toBeGreaterThanOrEqual(track.getBoundingClientRect().bottom);
                expect(rowBox.bottom, el.localName).toBeLessThanOrEqual(host.bottom);
                // No dot lies on a slide, and the row of them is in the middle.
                for (const dot of dots) {
                    expect(dot.getBoundingClientRect().top, el.localName).toBeGreaterThan(rowBox.top);
                }
                const middle = (centerOf(dots[0]).x + centerOf(dots[2]).x) / 2;
                expect(middle, el.localName).toBeCloseTo(host.left + host.width / 2, 0);
            }
        });

        it('has the arrows on the track, in the middle of its height and at its two sides', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                const { track, arrows } = controlsOf(el);
                const trackBox = track.getBoundingClientRect();
                const [back, forward] = arrows.map((arrow) => arrow.getBoundingClientRect());
                expect(centerOf(arrows[0]).y, el.localName).toBeCloseTo(centerOf(track).y, 0);
                expect(centerOf(arrows[1]).y, el.localName).toBeCloseTo(centerOf(track).y, 0);
                // --el-space-2 from the edge, 0.5rem without the token.
                expect(back.left - trackBox.left, el.localName).toBeCloseTo(8, 0);
                expect(trackBox.right - forward.right, el.localName).toBeCloseTo(8, 0);
            }
        });

        it('takes a click on a dot in a square of 24 px around it that no other dot covers', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                for (const dot of controlsOf(el).dots) {
                    dot.scrollIntoView({ block: 'center' });
                    const center = centerOf(dot);
                    // 11 px from the middle in every direction is still this dot: 2 × 11 < 24.
                    for (const [dx, dy] of [
                        [-11, 0],
                        [11, 0],
                        [0, -11],
                        [0, 11],
                    ]) {
                        expect(el.shadowRoot.elementFromPoint(center.x + dx, center.y + dy), el.localName).toBe(dot);
                    }
                }
            }
        });

        it('lets a click beside the arrows through to the slides', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                const { track } = controlsOf(el);
                track.scrollIntoView({ block: 'center' });
                const { x, y } = centerOf(track);
                // The layer of the arrows covers the track, and is no target itself.
                expect(el.shadowRoot.elementFromPoint(x, y)?.matches('[part~="arrows"]'), el.localName).not.toBe(true);
            }
        });
    });

    describe('a page that wants the dots on the slides', () => {
        it('lays them on the track with one rule for the part', async () => {
            const style = document.createElement('style');
            style.textContent = `
                el-carousel::part(dots),
                el-slider::part(dots) {
                    grid-area: 1 / 1;
                    align-self: end;
                    z-index: 1;
                }
            `;
            document.head.append(style);
            try {
                const [carousel, slider] = await bothFixture();

                for (const el of [carousel, slider]) {
                    const { track, row, dots } = controlsOf(el);
                    const trackBox = track.getBoundingClientRect();
                    // The row is at the lower edge of the track, and the component is as high as its track.
                    expect(row.getBoundingClientRect().bottom, el.localName).toBeCloseTo(trackBox.bottom, 0);
                    expect(el.getBoundingClientRect().height, el.localName).toBeCloseTo(trackBox.height, 0);
                    // A dot is above the slide: it takes the click.
                    dots[1].scrollIntoView({ block: 'center' });
                    const { x, y } = centerOf(dots[1]);
                    expect(el.shadowRoot.elementFromPoint(x, y), el.localName).toBe(dots[1]);
                }
            } finally {
                style.remove();
            }
        });
    });

    describe('the keyboard focus', () => {
        it('shows inside of an arrow, in the text colour of the arrow without a theme', async () => {
            const [carousel, slider, before] = await bothFixture();

            for (const el of [carousel, slider]) {
                const arrow = controlsOf(el).arrows[1];
                await tabTo(before, arrow);
                // The width of the ring and of the border inside of the edge.
                expect(ringOf(arrow), el.localName).toEqual(['solid', '2px', getComputedStyle(arrow).color, '-3px']);
            }
        });

        it('shows inside of an arrow with the ring of a theme', async () => {
            const [carousel, slider, before] = await bothFixture(THEME);

            for (const el of [carousel, slider]) {
                const arrow = controlsOf(el).arrows[1];
                await tabTo(before, arrow);
                expect(ringOf(arrow), el.localName).toEqual(['solid', '3px', 'rgb(200, 0, 100)', '-5px']);
            }
        });

        it('shows around a dot of the slider, without a theme and with one', async () => {
            // The bullets of the carousel are no buttons, and the Tab key does not reach them.
            for (const [style, ring] of [
                ['', ['solid', '2px', 'rgb(40, 50, 60)', '2px']],
                [THEME, ['solid', '3px', 'rgb(200, 0, 100)', '1px']],
            ]) {
                const [, slider, before] = await bothFixture(style);
                const dot = controlsOf(slider).dots[1];
                await tabTo(before, dot);
                expect(ringOf(dot)).toEqual(ring);
            }
        });

        it('does not show for a click', async () => {
            const [carousel, slider] = await bothFixture();

            for (const el of [carousel, slider]) {
                const arrow = controlsOf(el).arrows[1];
                await userEvent.click(arrow);
                expect(ringOf(arrow)[0], el.localName).toBe('none');
            }
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('keeps the ring of a dot, the disc of the selected one and the border of an arrow', async () => {
            const [carousel, slider] = await bothFixture(THEME);

            for (const el of [carousel, slider]) {
                const { idle, selected, arrows } = controlsOf(el);
                expect(lookOf(idle), el.localName).toMatchObject({ borderTopStyle: 'solid', borderTopWidth: '2px' });
                expect(lookOf(selected), el.localName).toMatchObject({
                    borderTopStyle: 'solid',
                    borderTopWidth: '5px',
                });
                expect(lookOf(arrows[1]), el.localName).toMatchObject({
                    borderTopStyle: 'solid',
                    borderTopWidth: '2px',
                });
                // A colour of the system, and not the one of the theme.
                for (const control of [idle, selected, arrows[1]]) {
                    const colour = lookOf(control).borderTopColor;
                    expect(colour, el.localName).not.toBe(TRANSPARENT);
                    expect(['rgb(90, 90, 90)', 'rgb(0, 80, 200)', 'rgb(120, 120, 120)'], el.localName).not.toContain(
                        colour,
                    );
                }
            }
        });

        it('shows an arrow that leads nowhere in the grey of the system', async () => {
            const [, slider] = await bothFixture(THEME);
            const probe = await fixture(`<span style="color: GrayText">probe</span>`);
            const grey = getComputedStyle(probe).color;
            const [back, forward] = controlsOf(slider).arrows;

            expect(lookOf(back)).toMatchObject({ color: grey, borderTopColor: grey });
            expect(lookOf(forward).color).not.toBe(grey);
        });
    });
});

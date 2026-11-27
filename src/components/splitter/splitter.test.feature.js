import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    realPointer,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './splitter.js';
define();

const wrappers = [];
afterEach(async () => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
    getSelection().removeAllRanges();
    // The pointer of one test is still there in the next, and under it an edge is a mark where the
    // page can hover: it waits in a corner no fixture reaches.
    await realPointer().move(410, 890);
});

// A theme: lines of 1px, and colours that can be told apart.
const theme = `
    --el-border-width: 1px; --el-touch-target: 44px; --el-space-2: 8px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(200, 0, 0);
    --el-focus-ring-width: 2px;
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const text = 'Words of a text the pointer passes while it drags the edge. '.repeat(6);

/**
 * Two panes of a page with the splitter between them. The page takes the width from the event, as
 * a page does. With `placement="start"` the pane the splitter sizes is the one after it.
 */
const panes = async ({
    attributes = 'label="List" value="160" min="100" max="300"',
    style = theme,
    dir = 'ltr',
    start = false,
    rest = `<p>${text}</p>`,
    follow = true,
} = {}) => {
    const pane = `<div id="pane" style="flex: none; width: 160px; overflow: hidden"><p>${text}</p></div>`;
    const other = `<div id="rest" style="flex: 1; min-width: 0; overflow: hidden">${rest}</div>`;
    const splitter = `<el-splitter ${attributes} ${start ? 'placement="start"' : ''}></el-splitter>`;
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: 400px;">
            <div style="display: flex; height: 200px">
                ${start ? other + splitter + pane : pane + splitter + other}
            </div>
            <button id="after" type="button">After</button>
        </div>
    `);
    wrappers.push(wrapper);
    const el = wrapper.querySelector('el-splitter');
    const sized = wrapper.querySelector('#pane');
    if (follow) {
        el.addEventListener('splitter-resize', (event) => {
            sized.style.width = `${event.detail.value}px`;
        });
    }
    await nextFrame();
    await nextFrame();
    return el;
};

const base = (el) => el.shadowRoot.querySelector('[part~="base"]');
const line = (el) => el.shadowRoot.querySelector('[part~="line"]');
const pane = (el) => el.parentElement.querySelector('#pane');
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const box = (origin, node) => {
    const from = origin.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - from.left, top - from.top, width, height].map((value) => Math.round(value * 10) / 10);
};
/** A point on the edge: the middle of the line, 20px below its top. */
const grip = (el) => {
    const { left, top, width } = el.getBoundingClientRect();
    return [left + width / 2, top + 20];
};
/** Every event of the splitter, as its name and its value. */
const events = (el) => {
    const seen = [];
    for (const name of ['splitter-resize', 'splitter-resize-end']) {
        el.addEventListener(name, (event) => seen.push([name, event.detail.value]));
    }
    return seen;
};

describe('Feature | Splitter', () => {
    describe('the separator', () => {
        it('has a value, and the name of what it sizes', async () => {
            const el = await panes();
            const separator = base(el);

            expect(await accessibleRole(separator)).toBe('separator');
            expect(await accessibleName(separator)).toBe('List');
            expect(separator.getAttribute('aria-orientation')).toBe('vertical');
            expect(separator.getAttribute('aria-valuenow')).toBe('160');
            expect(separator.getAttribute('aria-valuemin')).toBe('100');
            expect(separator.getAttribute('aria-valuemax')).toBe('300');
        });

        it('takes a width from the page, and says nothing of it', async () => {
            const el = await panes();
            const seen = events(el);

            el.value = 220;
            await rendered();
            expect(base(el).getAttribute('aria-valuenow')).toBe('220');

            el.setAttribute('value', '140');
            await rendered();
            expect(base(el).getAttribute('aria-valuenow')).toBe('140');
            expect(seen).toEqual([]);
        });

        it('says a width between the least and the greatest one', async () => {
            const el = await panes({ attributes: 'label="List" value="900" min="100" max="300"' });
            expect(base(el).getAttribute('aria-valuenow')).toBe('300');

            el.value = 20;
            await rendered();
            expect(base(el).getAttribute('aria-valuenow')).toBe('100');
        });
    });

    describe('the edge', () => {
        it('is thin, as high as its row, and takes the pointer in a wider area around it', async () => {
            const el = await panes();
            const row = el.parentElement;

            // The line of 1px after the pane of 160px.
            expect(box(row, el)).toEqual([160, 0, 1, 200]);
            expect(getComputedStyle(line(el)).borderLeftWidth).toBe('1px');
            expect(getComputedStyle(line(el)).borderLeftColor).toBe('rgb(150, 150, 150)');
            // What takes the pointer: 8px, with the line in its middle.
            expect(box(row, base(el))).toEqual([156.5, 0, 8, 200]);
            expect(getComputedStyle(base(el)).cursor).toBe('col-resize');
            // The area lies over the panes: a point beside the line is the splitter.
            const [x, y] = grip(el);
            expect(document.elementFromPoint(x - 3, y)).toBe(el);
            expect(document.elementFromPoint(x + 3, y)).toBe(el);
        });

        it('paints no line without a theme, and still takes the pointer', async () => {
            const el = await panes({ style: 'font: 16px/24px sans-serif;' });

            expect(box(el.parentElement, el)).toEqual([160, 0, 0, 200]);
            expect(getComputedStyle(line(el)).borderLeftWidth).toBe('0px');
            expect(box(el.parentElement, base(el))).toEqual([156, 0, 8, 200]);
        });

        // Under a pointer that hovers the line is the same mark. That is not checked: whether a
        // page of the tests can hover is not the same on every machine once a test has made it a
        // touch screen (see useTouchScreen()).
        it('is a mark while it is dragged', async () => {
            const el = await panes();
            const pointer = realPointer();
            const [x, y] = grip(el);

            await pointer.down(x, y);

            const { borderLeftWidth, borderLeftColor } = getComputedStyle(line(el));
            expect([borderLeftWidth, borderLeftColor]).toEqual(['3px', 'rgb(0, 0, 200)']);
            await pointer.up();
        });

        it('has the width a page gives its line', async () => {
            const el = await panes({ style: `${theme} --el-splitter-line-width: 4px;` });

            expect(box(el.parentElement, el)).toEqual([160, 0, 4, 200]);
            expect(getComputedStyle(line(el)).borderLeftWidth).toBe('4px');
        });
    });

    for (const type of ['mouse', 'pen', 'touch']) {
        describe(`dragged with a ${type === 'touch' ? 'finger' : type}`, () => {
            it('follows the pointer, and tells of every width and of the one that stays', async () => {
                const el = await panes();
                const seen = events(el);
                const pointer = realPointer(type);
                const [x, y] = grip(el);

                await pointer.down(x, y);
                expect(el.matches(':state(dragging)')).toBe(true);
                await pointer.move(x + 25, y);
                await pointer.move(x + 40, y + 30);
                await rendered();

                expect(el.value).toBe(200);
                expect(pane(el).getBoundingClientRect().width).toBe(200);
                expect(base(el).getAttribute('aria-valuenow')).toBe('200');
                expect(seen).toEqual([
                    ['splitter-resize', 185],
                    ['splitter-resize', 200],
                ]);

                await pointer.up();
                expect(el.matches(':state(dragging)')).toBe(false);
                expect(seen.at(-1)).toEqual(['splitter-resize-end', 200]);
                expect(seen.length).toBe(3);

                // The pointer has let go: a move after it changes nothing. A finger that is
                // lifted does not move.
                if (type !== 'touch') await pointer.move(x + 80, y);
                expect(el.value).toBe(200);
                expect(seen.length).toBe(3);
            });

            it('stops at the least and at the greatest width', async () => {
                const el = await panes();
                const seen = events(el);
                const pointer = realPointer(type);
                const [x, y] = grip(el);

                await pointer.down(x, y);
                await pointer.move(x + 220, y);
                await rendered();
                expect(el.value).toBe(300);
                expect(pane(el).getBoundingClientRect().width).toBe(300);

                await pointer.move(x - 150, y);
                await rendered();
                expect(el.value).toBe(100);

                // Further out there is no other width, and nothing to tell.
                await pointer.move(x - 155, y);
                await pointer.up();
                expect(seen).toEqual([
                    ['splitter-resize', 300],
                    ['splitter-resize', 100],
                    ['splitter-resize-end', 100],
                ]);
            });

            it('selects no text on its way', async () => {
                const el = await panes();
                const pointer = realPointer(type);
                const [x, y] = grip(el);

                await pointer.down(x, y);
                await pointer.move(x + 60, y + 40);
                await pointer.move(x + 120, y + 90);
                expect(getSelection().toString()).toBe('');
                await pointer.up();

                expect(getSelection().toString()).toBe('');
                expect(el.value).toBe(280);
            });

            it('keeps following the pointer over an iframe', async () => {
                // A page that is slow to take the width: the edge stays behind, and the pointer
                // is over what is beside it.
                const el = await panes({
                    follow: false,
                    rest: `<iframe title="A page in the page" srcdoc="<p>${text}</p>" style="display: block; width: 100%; height: 200px; border: 0"></iframe>`,
                });
                const seen = events(el);
                const pointer = realPointer(type);
                const [x, y] = grip(el);
                await rendered();

                // The page in the page hears nothing of the pointer.
                const inFrame = [];
                const page = el.parentElement.querySelector('iframe').contentDocument;
                for (const name of ['pointermove', 'pointerup']) {
                    page.addEventListener(name, () => inFrame.push(name));
                }
                expect(document.elementFromPoint(x + 50, y + 60).localName).toBe('iframe');

                await pointer.down(x, y);
                await pointer.move(x + 50, y + 60);
                await pointer.move(x + 90, y + 60);
                expect(el.value).toBe(250);
                expect(inFrame).toEqual([]);

                // And lets go there.
                await pointer.up();
                expect(el.matches(':state(dragging)')).toBe(false);
                expect(seen).toEqual([
                    ['splitter-resize', 210],
                    ['splitter-resize', 250],
                    ['splitter-resize-end', 250],
                ]);
                expect(inFrame).toEqual([]);
                // The edge covers nothing once it is let go.
                expect(document.elementFromPoint(x + 50, y + 60).localName).toBe('iframe');
            });
        });
    }

    describe('a pointer that does not move it', () => {
        it('tells of nothing', async () => {
            const el = await panes();
            const seen = events(el);
            const pointer = realPointer();
            const [x, y] = grip(el);

            await pointer.down(x, y);
            await pointer.up();

            expect(seen).toEqual([]);
            expect(el.value).toBe(160);
        });

        it('ends a drag whose end never arrived when the next one starts', async () => {
            const el = await panes();
            const seen = events(el);
            const separator = base(el);
            const at = (clientX, pointerId) => ({ pointerId, button: 0, clientX, isPrimary: true, bubbles: true });

            separator.dispatchEvent(new PointerEvent('pointerdown', at(160, 7)));
            separator.dispatchEvent(new PointerEvent('pointermove', at(190, 7)));
            expect(el.value).toBe(190);

            // No pointerup: the pointer was let go where the page did not hear of it.
            separator.dispatchEvent(new PointerEvent('pointerdown', at(190, 8)));
            expect(seen).toEqual([
                ['splitter-resize', 190],
                ['splitter-resize-end', 190],
            ]);
            separator.dispatchEvent(new PointerEvent('pointermove', at(200, 8)));
            separator.dispatchEvent(new PointerEvent('pointerup', at(200, 8)));
            expect(el.value).toBe(200);
            expect(el.matches(':state(dragging)')).toBe(false);
        });

        it('does not take the edge with another button', async () => {
            const el = await panes();
            const seen = events(el);

            base(el).dispatchEvent(
                new PointerEvent('pointerdown', { pointerId: 1, button: 2, clientX: 160, bubbles: true }),
            );

            expect(el.matches(':state(dragging)')).toBe(false);
            expect(seen).toEqual([]);
        });
    });

    describe('with the keyboard', () => {
        it('is a stop of the Tab key and shows its focus', async () => {
            const el = await panes();

            await userEvent.tab();

            expect(document.activeElement).toBe(el);
            expect(el.shadowRoot.activeElement).toBe(base(el));
            const { outlineStyle, outlineWidth, outlineColor } = getComputedStyle(base(el));
            expect([outlineStyle, outlineWidth, outlineColor]).toEqual(['solid', '2px', 'rgb(200, 0, 0)']);
            // The line is the mark it is under the pointer.
            expect(getComputedStyle(line(el)).borderLeftWidth).toBe('3px');

            await userEvent.tab();
            expect(document.activeElement.id).toBe('after');
        });

        it('moves in steps with the arrow keys', async () => {
            const el = await panes();
            const seen = events(el);
            await userEvent.tab();

            await userEvent.keyboard('{ArrowRight}');
            await rendered();
            expect(el.value).toBe(176);
            expect(pane(el).getBoundingClientRect().width).toBe(176);
            expect(base(el).getAttribute('aria-valuenow')).toBe('176');

            await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
            await rendered();
            expect(el.value).toBe(144);
            // Every key is a width of its own, and one that stays.
            expect(seen).toEqual([
                ['splitter-resize', 176],
                ['splitter-resize-end', 176],
                ['splitter-resize', 160],
                ['splitter-resize-end', 160],
                ['splitter-resize', 144],
                ['splitter-resize-end', 144],
            ]);
        });

        it('takes the step the page sets', async () => {
            const el = await panes({ attributes: 'label="List" value="160" min="100" max="300" step="50"' });
            await userEvent.tab();

            await userEvent.keyboard('{ArrowRight}');
            expect(el.value).toBe(210);
        });

        it('goes to the least width with Home and to the greatest with End', async () => {
            const el = await panes();
            const seen = events(el);
            await userEvent.tab();

            await userEvent.keyboard('{End}');
            expect(el.value).toBe(300);
            await userEvent.keyboard('{Home}');
            expect(el.value).toBe(100);

            // At the end there is no further width, and nothing to tell.
            await userEvent.keyboard('{ArrowLeft}{Home}');
            expect(seen).toEqual([
                ['splitter-resize', 300],
                ['splitter-resize-end', 300],
                ['splitter-resize', 100],
                ['splitter-resize-end', 100],
            ]);
        });

        it('stops at the greatest width with a step that goes past it', async () => {
            const el = await panes({ attributes: 'label="List" value="295" min="100" max="300"' });
            await userEvent.tab();

            await userEvent.keyboard('{ArrowRight}');
            expect(el.value).toBe(300);
        });

        it('leaves every other key to the page', async () => {
            const el = await panes();
            const seen = events(el);
            const keys = [];
            el.parentElement.addEventListener('keydown', (event) => keys.push([event.key, event.defaultPrevented]));
            await userEvent.tab();

            await userEvent.keyboard('{ArrowUp}{ArrowDown}a{Control>}{ArrowRight}{/Control}');
            await userEvent.keyboard('{ArrowRight}');

            expect(seen).toEqual([
                ['splitter-resize', 176],
                ['splitter-resize-end', 176],
            ]);
            expect(keys.filter(([key]) => key !== 'Control')).toEqual([
                ['ArrowUp', false],
                ['ArrowDown', false],
                ['a', false],
                ['ArrowRight', false],
                ['ArrowRight', true],
            ]);
        });
    });

    describe('the reading direction', () => {
        it('turns the drag and the arrow keys around in a right-to-left page', async () => {
            const el = await panes({ dir: 'rtl' });
            const pointer = realPointer();
            const [x, y] = grip(el);

            // The pane is at the right: the edge moves to the left to make it wider.
            expect(Math.round(pane(el).getBoundingClientRect().right)).toBe(
                Math.round(el.parentElement.getBoundingClientRect().right),
            );
            await pointer.down(x, y);
            await pointer.move(x - 40, y);
            await pointer.up();
            await rendered();
            expect(el.value).toBe(200);
            expect(pane(el).getBoundingClientRect().width).toBe(200);

            // The edge has the focus from the pointer that took it.
            expect(document.activeElement).toBe(el);
            await userEvent.keyboard('{ArrowLeft}');
            expect(el.value).toBe(216);
            await userEvent.keyboard('{ArrowRight}{ArrowRight}');
            expect(el.value).toBe(184);
        });
    });

    describe('at the start edge of its pane', () => {
        it('makes the pane after it wider when it moves to the start', async () => {
            const el = await panes({ start: true });
            const pointer = realPointer();
            const [x, y] = grip(el);

            await pointer.down(x, y);
            await pointer.move(x - 40, y);
            await pointer.up();
            await rendered();
            expect(el.value).toBe(200);
            expect(pane(el).getBoundingClientRect().width).toBe(200);

            await userEvent.keyboard('{ArrowLeft}');
            expect(el.value).toBe(216);
            await userEvent.keyboard('{ArrowRight}{ArrowRight}');
            expect(el.value).toBe(184);
        });

        it('turns around as well in a right-to-left page', async () => {
            const el = await panes({ start: true, dir: 'rtl' });
            const pointer = realPointer();
            const [x, y] = grip(el);

            await pointer.down(x, y);
            await pointer.move(x + 40, y);
            await pointer.up();
            expect(el.value).toBe(200);

            await userEvent.keyboard('{ArrowRight}');
            expect(el.value).toBe(216);
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('can be seen, without a theme as well', async () => {
            const themed = await panes();
            const bare = await panes({ style: 'font: 16px/24px sans-serif;' });

            expect(getComputedStyle(line(themed)).borderLeftWidth).toBe('1px');
            expect(getComputedStyle(line(themed)).borderLeftColor).not.toBe('rgb(150, 150, 150)');
            expect(getComputedStyle(line(bare)).borderLeftWidth).toBe('1px');
            expect(getComputedStyle(line(bare)).borderLeftStyle).toBe('solid');
        });

        it('shows its focus', async () => {
            const el = await panes();
            await userEvent.tab();

            const { outlineStyle, outlineWidth } = getComputedStyle(base(el));
            expect([outlineStyle, outlineWidth]).toEqual(['solid', '2px']);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('takes a finger in an area as wide as the touch target', async () => {
            const el = await panes();
            const row = el.parentElement;

            expect(box(row, el)).toEqual([160, 0, 1, 200]);
            expect(box(row, base(el))).toEqual([160.5 - 22, 0, 44, 200]);
            expect(getComputedStyle(base(el)).touchAction).toBe('none');
        });

        it('stays as it is without the token', async () => {
            const el = await panes({ style: theme.replace('--el-touch-target: 44px;', '') });
            expect(box(el.parentElement, base(el))[2]).toBe(8);
        });
    });

    describe('accessibility', () => {
        it('passes axe', async () => {
            const el = await panes();
            const results = await axe.run(el.parentElement.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe with the focus on it', async () => {
            const el = await panes();
            await userEvent.tab();
            const results = await axe.run(el.parentElement.parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});

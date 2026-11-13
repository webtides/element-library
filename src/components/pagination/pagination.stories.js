import { userEvent, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './pagination.readme.md?raw';
import { define } from './pagination.js';
define();

const sizes = ['small', 'medium', 'large'];
const row = (el) =>
    [...el.shadowRoot.querySelectorAll("[part~='list'] > li")]
        .slice(1, -1)
        .map((li) => (li.matches("[part~='ellipsis']") ? '…' : li.textContent.trim()))
        .join(' ');

export default {
    title: 'Components/Pagination',
    component: 'el-pagination',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        page: 1,
        total: 200,
        perPage: 10,
        siblings: 1,
        boundaries: 1,
        size: 'medium',
    },
    argTypes: {
        page: { control: { type: 'number', min: 1 } },
        total: { control: { type: 'number', min: 0 } },
        perPage: { control: { type: 'number', min: 1 } },
        siblings: { control: { type: 'number', min: 0, max: 3 } },
        boundaries: { control: { type: 'number', min: 0, max: 3 } },
        size: { options: sizes, control: { type: 'inline-radio' } },
    },
};

export const Playground = {
    render: ({ page, total, perPage, siblings, boundaries, size }) => html`
        <el-pagination
            page="${page}"
            total="${total}"
            per-page="${perPage}"
            siblings="${siblings}"
            boundaries="${boundaries}"
            size="${size}"
        ></el-pagination>
    `,
    play: async ({ canvasElement, step }) => {
        const el = canvasElement.querySelector('el-pagination');
        const button = (name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
        await waitFor(() => expect(button('current')).not.toBeNull());

        await step('starts on the first page, which has no page before it', async () => {
            await expect(row(el)).toBe('1 2 3 4 5 … 20');
            await expect(button('current')).toHaveAttribute('aria-label', 'Page 1');
            await expect(button('previous')).toBeDisabled();
        });

        await step('a button of a page goes to that page and says so', async () => {
            const pages = [];
            el.addEventListener('pagination-change', (event) => pages.push(event.detail.page), { once: true });
            await userEvent.click(el.shadowRoot.querySelector('[data-page="5"][part~="page"]'));
            await waitFor(() => expect(row(el)).toBe('1 … 4 5 6 … 20'));
            await expect(pages).toEqual([5]);
            await expect(el.page).toBe(5);
        });

        await step('the arrow buttons go one page on and one page back', async () => {
            await userEvent.click(button('next'));
            await waitFor(() => expect(button('current')).toHaveAttribute('aria-label', 'Page 6'));
            await userEvent.click(button('previous'));
            await userEvent.click(button('previous'));
            await waitFor(() => expect(button('current')).toHaveAttribute('aria-label', 'Page 4'));
            await expect(row(el)).toBe('1 2 3 4 5 … 20');
        });
    },
};

export const WithAList = {
    name: 'With a list',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The pagination loads nothing itself. The page listens for `pagination-change` and shows the entries of the page in `event.detail.page`.',
            },
        },
    },
    render: () => html`
        <div
            style="display:grid;gap:1rem;max-width:28rem"
            @pagination-change="${(event) => {
                const first = (event.detail.page - 1) * 5 + 1;
                event.currentTarget.querySelector('ol').start = first;
                event.currentTarget
                    .querySelectorAll('li')
                    .forEach((item, index) => (item.textContent = `Entry ${first + index}`));
            }}"
        >
            <ol style="margin:0;padding-inline-start:2.5rem;list-style:decimal" start="1">
                <li>Entry 1</li>
                <li>Entry 2</li>
                <li>Entry 3</li>
                <li>Entry 4</li>
                <li>Entry 5</li>
            </ol>
            <el-pagination total="60" per-page="5" label="Pages of the entries"></el-pagination>
        </div>
    `,
    play: async ({ canvasElement, step }) => {
        const el = canvasElement.querySelector('el-pagination');
        await waitFor(() => expect(el.shadowRoot.querySelector('[data-page="3"][part~="page"]')).not.toBeNull());

        await step('the third page shows the entries from 11 on', async () => {
            await userEvent.click(el.shadowRoot.querySelector('[data-page="3"][part~="page"]'));
            await waitFor(() => expect(canvasElement.querySelector('li')).toHaveTextContent('Entry 11'));
            await expect(canvasElement.querySelector('ol').start).toBe(11);
        });
    },
};

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The buttons are squares of the control height of the size, like the height of a button or a field of that size.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem">
            ${sizes.map(
                (size) =>
                    html`<el-pagination total="200" page="10" size="${size}" label="Pages, ${size}"></el-pagination>`,
            )}
        </div>
    `,
};

export const SiblingsAndBoundaries = {
    name: 'Siblings and boundaries',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`siblings` is the number of pages on each side of the current one, `boundaries` the number of pages at the start and at the end. With `boundaries="0"` the row has no first and no last page.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem">
            <el-pagination total="200" page="10" siblings="0" label="No siblings"></el-pagination>
            <el-pagination total="200" page="10" label="One sibling, one boundary"></el-pagination>
            <el-pagination total="200" page="10" siblings="2" label="Two siblings"></el-pagination>
            <el-pagination total="200" page="10" boundaries="2" label="Two boundaries"></el-pagination>
            <el-pagination total="200" page="10" boundaries="0" label="No boundaries"></el-pagination>
        </div>
    `,
    play: async ({ canvasElement }) => {
        const elements = [...canvasElement.querySelectorAll('el-pagination')];
        await waitFor(() => expect(elements.every((el) => el.shadowRoot?.querySelector('[aria-current]'))).toBe(true));
        await expect(elements.map(row)).toEqual([
            '1 … 10 … 20',
            '1 … 9 10 11 … 20',
            '1 … 8 9 10 11 12 … 20',
            '1 2 … 9 10 11 … 19 20',
            '… 9 10 11 …',
        ]);
    },
};

export const TheEnds = {
    name: 'The first and the last page',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The row is as long on the first and on the last page as in the middle. The button that leads nowhere is disabled, and a list of one page has both of them disabled.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem">
            <el-pagination total="200" page="1" label="On the first page"></el-pagination>
            <el-pagination total="200" page="20" label="On the last page"></el-pagination>
            <el-pagination total="8" label="One page"></el-pagination>
        </div>
    `,
};

export const OwnIconsAndLabels = {
    name: 'Own icons and labels',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The slots `previous-icon` and `next-icon` take icons of the page. The names of the landmark and of the buttons come from attributes, here in German.',
            },
        },
    },
    render: () => html`
        <el-pagination
            total="200"
            page="10"
            label="Seiten der Suche"
            page-label="Seite"
            previous-label="Vorherige Seite"
            next-label="Nächste Seite"
        >
            <span slot="previous-icon" aria-hidden="true">←</span>
            <span slot="next-icon" aria-hidden="true">→</span>
        </el-pagination>
    `,
    play: async ({ canvasElement }) => {
        const el = canvasElement.querySelector('el-pagination');
        await waitFor(() => expect(el.shadowRoot.querySelector('[aria-current]')).not.toBeNull());
        await expect(el.shadowRoot.querySelector('nav')).toHaveAttribute('aria-label', 'Seiten der Suche');
        await expect(el.shadowRoot.querySelector('[aria-current]')).toHaveAttribute('aria-label', 'Seite 10');
        await expect(el.shadowRoot.querySelector('[part~="next"]')).toHaveAttribute('aria-label', 'Nächste Seite');
    },
};

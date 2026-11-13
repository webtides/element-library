import { describe, it, expect } from 'vite-plus/test';
import { fixture } from '../../test-helpers.js';
import Pagination, { define } from './pagination.js';
import Events from './pagination.events.js';
define();

// The row between the two arrow buttons, as it reads: "1 … 4 5 6 … 10".
const items = (el) =>
    [...el.shadowRoot.querySelectorAll("[part~='list'] > li")]
        .slice(1, -1)
        .map((li) => (li.matches("[part~='ellipsis']") ? '…' : li.textContent.trim()));
const row = (el) => items(el).join(' ');
const paginations = async (markup) => {
    const wrapper = await fixture(`<div>${markup}</div>`);
    const elements = [...wrapper.children];
    return { elements, remove: () => wrapper.remove() };
};

describe('Unit | Pagination', () => {
    it('can be created without errors', async () => {
        const el = new Pagination();
        expect(el).toBeInstanceOf(Pagination);
    });

    it('is on the first page of an empty list, with ten entries per page, by default', async () => {
        const el = new Pagination();
        expect(el.properties()).toEqual({
            page: 1,
            total: 0,
            perPage: 10,
            siblings: 1,
            boundaries: 1,
            size: 'medium',
            label: 'Pagination',
            pageLabel: 'Page',
            previousLabel: 'Previous page',
            nextLabel: 'Next page',
        });
    });

    it('exposes the event-name constants', async () => {
        expect(Events.CHANGE).toBe('pagination-change');
    });

    describe('pages', () => {
        it('is the total divided by the entries per page, rounded up', async () => {
            const cases = [
                [0, 10, 1],
                [1, 10, 1],
                [10, 10, 1],
                [11, 10, 2],
                [95, 10, 10],
                [100, 25, 4],
                [101, 25, 5],
                [5, 1, 5],
            ];
            const { elements, remove } = await paginations(
                cases
                    .map(([total, perPage]) => `<el-pagination total="${total}" per-page="${perPage}"></el-pagination>`)
                    .join(''),
            );

            expect(elements.map((el) => el.pages)).toEqual(cases.map(([, , pages]) => pages));
            // And that many buttons, up to the seven places of the row.
            expect(elements.map((el) => items(el).length)).toEqual(cases.map(([, , pages]) => Math.min(pages, 7)));
            remove();
        });

        it('counts with ten entries per page for a value that is no number of entries', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="95" per-page="0"></el-pagination>
                <el-pagination total="95" per-page="-5"></el-pagination>
                <el-pagination total="95" per-page="many"></el-pagination>
                <el-pagination total="95" per-page="2.9"></el-pagination>
            `);

            // 2.9 entries per page are 2.
            expect(elements.map((el) => el.pages)).toEqual([10, 10, 10, 48]);
            remove();
        });

        it('has one page for a total that is no number of entries', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="-30"></el-pagination>
                <el-pagination total="many"></el-pagination>
                <el-pagination></el-pagination>
            `);

            expect(elements.map((el) => el.pages)).toEqual([1, 1, 1]);
            expect(elements.map(row)).toEqual(['1', '1', '1']);
            remove();
        });
    });

    describe('row', () => {
        it('shows every page while they fit into the seven places', async () => {
            const { elements, remove } = await paginations(
                [1, 4, 7].map((page) => `<el-pagination total="70" page="${page}"></el-pagination>`).join(''),
            );

            expect(elements.map(row)).toEqual(['1 2 3 4 5 6 7', '1 2 3 4 5 6 7', '1 2 3 4 5 6 7']);
            remove();
        });

        it('leaves out the pages between the ends and the pages around the current one', async () => {
            const { elements, remove } = await paginations(
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    .map((page) => `<el-pagination total="100" page="${page}"></el-pagination>`)
                    .join(''),
            );

            expect(elements.map(row)).toEqual([
                '1 2 3 4 5 … 10',
                '1 2 3 4 5 … 10',
                '1 2 3 4 5 … 10',
                '1 2 3 4 5 … 10',
                '1 … 4 5 6 … 10',
                '1 … 5 6 7 … 10',
                '1 … 6 7 8 9 10',
                '1 … 6 7 8 9 10',
                '1 … 6 7 8 9 10',
                '1 … 6 7 8 9 10',
            ]);
            remove();
        });

        it('shows the page itself where an ellipsis would stand for one page only', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="80" page="4"></el-pagination>
                <el-pagination total="80" page="5"></el-pagination>
            `);

            expect(elements.map(row)).toEqual(['1 2 3 4 5 … 8', '1 … 4 5 6 7 8']);
            remove();
        });

        it('shows as many pages around the current one as siblings says', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="200" page="10" siblings="0"></el-pagination>
                <el-pagination total="200" page="10" siblings="2"></el-pagination>
                <el-pagination total="200" page="1" siblings="0"></el-pagination>
                <el-pagination total="200" page="20" siblings="2"></el-pagination>
            `);

            expect(elements.map(row)).toEqual([
                '1 … 10 … 20',
                '1 … 8 9 10 11 12 … 20',
                '1 2 3 … 20',
                '1 … 14 15 16 17 18 19 20',
            ]);
            remove();
        });

        it('shows as many pages at both ends as boundaries says, and none with 0', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="200" page="10" boundaries="2"></el-pagination>
                <el-pagination total="200" page="10" boundaries="0"></el-pagination>
                <el-pagination total="200" page="1" boundaries="0"></el-pagination>
                <el-pagination total="200" page="20" boundaries="0"></el-pagination>
            `);

            expect(elements.map(row)).toEqual(['1 2 … 9 10 11 … 19 20', '… 9 10 11 …', '1 2 3 4 …', '… 17 18 19 20']);
            remove();
        });

        it('takes a count that is no number as the default, and a negative one as 0', async () => {
            const { elements, remove } = await paginations(`
                <el-pagination total="200" page="10" siblings="some" boundaries="some"></el-pagination>
                <el-pagination total="200" page="10" siblings="-1" boundaries="-1"></el-pagination>
            `);

            expect(elements.map(row)).toEqual(['1 … 9 10 11 … 20', '… 10 …']);
            remove();
        });

        it('is a row without gaps and of one length, on every page of lists of every length', async () => {
            const cases = [];
            for (let pages = 1; pages <= 14; pages++) {
                for (const siblings of [0, 1, 2]) {
                    for (const boundaries of [0, 1, 2]) {
                        for (let page = 1; page <= pages; page++) cases.push({ pages, siblings, boundaries, page });
                    }
                }
            }
            const { elements, remove } = await paginations(
                cases
                    .map(
                        ({ pages, siblings, boundaries, page }) =>
                            `<el-pagination total="${pages * 10}" page="${page}" siblings="${siblings}" boundaries="${boundaries}"></el-pagination>`,
                    )
                    .join(''),
            );

            const problems = [];
            elements.forEach((el, index) => {
                const { pages, siblings, boundaries, page } = cases[index];
                const shown = items(el);
                const say = (what) => problems.push(`${JSON.stringify(cases[index])} "${shown.join(' ')}": ${what}`);

                if (shown.length !== Math.min(pages, 2 * boundaries + 2 * siblings + 3)) say('length');
                const marked = [...el.shadowRoot.querySelectorAll("[aria-current='page']")];
                if (marked.length !== 1 || marked[0].textContent.trim() !== String(page)) say('current page');

                // Every place, with the pages it stands for: one for a number, two or more for an
                // ellipsis. Together they are the pages from 1 to the last, in order.
                let expected = 1;
                shown.forEach((item, place) => {
                    if (item !== '…') {
                        if (Number(item) !== expected) say(`${item} in place of ${expected}`);
                        expected++;
                        return;
                    }
                    const next = shown[place + 1] === undefined ? pages + 1 : Number(shown[place + 1]);
                    if (Number.isNaN(next)) say('two ellipses in a row');
                    if (next - expected < 2) say('an ellipsis for less than two pages');
                    expected = next;
                });
                if (expected !== pages + 1) say('does not end with the last page');

                for (let near = page - siblings; near <= page + siblings; near++) {
                    if (near >= 1 && near <= pages && !shown.includes(String(near))) say(`sibling ${near} is missing`);
                }
                if (boundaries > 0 && (shown[0] !== '1' || shown.at(-1) !== String(pages))) say('ends');
            });

            expect(problems).toEqual([]);
            expect(elements.length).toBe(945);
            remove();
        });
    });
});

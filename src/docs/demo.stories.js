import { TemplateElement, defineElement, html } from '@webtides/element-js';

// Register every component the way a real consumer would (single side-effect import).
import '../../all.js';

export default {
    title: 'Demo/Example Page',
    parameters: {
        layout: 'fullscreen',
        // This is a composed page, not a single component — skip the autodocs/controls noise.
        controls: { disable: true },
        docs: {
            description: {
                component:
                    'A single, somewhat realistic page — a design system built with the library itself — that wires up ' +
                    'every component in the library the way they tend to be used together: a sticky header with a ' +
                    'dropdown resources menu, a hero carousel of palette swatches with a walkthrough dialog, token ' +
                    'tabs, a token-catalogue slider of cards, a list of the kit to browse (cards with an avatar, a ' +
                    'badge and a tag, filters as removable tags with a popover to bring one back, a button group ' +
                    'that sorts, a progress ring for the share that is shown, a progress bar for the place in the ' +
                    'list, a pagination, skeletons and a spinner while it loads, an empty state, and a drawer ' +
                    'with the details: a breadcrumb, a divider and a copy button for the import path), a ' +
                    'lazy-loaded pattern gallery, a request-access form built from ' +
                    'the field components (a submit with a field missing shows the messages of the fields, a ' +
                    'complete one floats a success toast, and "Start over" resets the form), an FAQ accordion, and the ' +
                    'transition + scroll helpers. The design-system framing leans into the ' +
                    'theming story — flip the **Theme** and **Color scheme** toolbar switches to see the whole page ' +
                    're-skin through the design tokens.',
            },
        },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────────

// An inline SVG sprite so <el-svg-use> has symbols to reference (spritePath="" → embedded symbols).
const sprite = html`
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
        <symbol id="icon-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </symbol>
        <symbol id="icon-palette" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2 2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 9 9 0 0 0-9-8z" />
            <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="11" r="1" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="icon-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </symbol>
        <symbol id="icon-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3 2 8l10 5 10-5-10-5z" />
            <path d="M2 13l10 5 10-5M2 18l10 5 10-5" />
        </symbol>
    </svg>
`;

const icon = (name) =>
    html`<el-svg-use
        name="${name}"
        spritePath=""
        style="display:inline-block;width:1.5rem;height:1.5rem"
    ></el-svg-use>`;

// Design-themed Unsplash IDs (verified to resolve) — the lazy gallery needs real <img> elements
// to actually demonstrate el-lazy-src. Everything else on the page is CSS/SVG.
// A mix of design-work shots (swatch palettes, UI design, icon sets) and clean color/gradient
// tiles that echo the swatch hero.
const photos = [
    'photo-1561070791-2526d30994b5', // color-swatch palettes + token charts on a desk
    'photo-1614851099175-e5b30eb6f696', // flat geometric color blocks
    'photo-1545235617-9465d2a55698', // UI design on a laptop + phone preview
    'photo-1579546929518-9e396f3cc809', // soft rainbow gradient
    'photo-1618221195710-dd6b41faaea6', // icon design on a tablet
    'photo-1620207418302-439b387441b0', // purple/pink gradient
];
const unsplash = (id, w = 500) => `https://images.unsplash.com/${id}?ixlib=rb-1.2.1&auto=format&fit=crop&w=${w}&q=70`;

const navLink = (selector, label) =>
    html`<el-scroll-to selector="${selector}"><a class="cursor-pointer hover:underline">${label}</a></el-scroll-to>`;

const dropdownItem = (label) =>
    html`<a class="block px-3 py-1.5 rounded hover:opacity-70 cursor-pointer" role="menuitem">${label}</a>`;

// A lazy-loaded image grid — the one place we genuinely need <img> to show el-lazy-src working.
const lazyGallery = (title, caption) => html`
    <section id="gallery" class="py-12">
        <h2 class="text-2xl font-bold mb-2">${title}</h2>
        <p class="opacity-70 mb-6 text-sm">${caption}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            ${photos.map(
                (id, i) => html`
                    <el-lazy-src
                        class="block rounded-lg overflow-hidden border"
                        style="border-color:var(--el-color-border,#e5e7eb)"
                    >
                        <img
                            data-src="${unsplash(id, 500)}"
                            alt="Gallery image ${i + 1}"
                            class="w-full h-40 object-cover"
                            width="500"
                            height="160"
                        />
                    </el-lazy-src>
                `,
            )}
        </div>
    </section>
`;

const scrollTopButton = html`
    <div style="position:fixed;right:1.5rem;bottom:1.5rem;z-index:50">
        <el-scroll-to-top duration="600">
            <el-button id="demo-to-top" variant="brand" circle="true" size="large" aria-label="Scroll to top">
                ↑
            </el-button>
        </el-scroll-to-top>
        <el-tooltip for="demo-to-top" placement="left">Back to the top of the page</el-tooltip>
    </div>
`;

// ─────────────────────────────────────────────────────────────────────────────
// The kit to browse: an element of the page, built from the components of the library
// ─────────────────────────────────────────────────────────────────────────────

const categories = ['Forms', 'Overlays', 'Feedback', 'Navigation', 'Surfaces'];

// A part of the kit, not all of it. `fresh` marks what came last.
const kit = [
    { tag: 'el-button', category: 'Forms', blurb: 'A button or a link, in five variants and three appearances.' },
    { tag: 'el-button-group', category: 'Forms', blurb: 'A row of buttons that reads as one control.', fresh: true },
    { tag: 'el-copy-button', category: 'Forms', blurb: 'Copies a text and says whether that worked.', fresh: true },
    { tag: 'el-input-field', category: 'Forms', blurb: 'A text input with a label, a help text and an error.' },
    { tag: 'el-select-field', category: 'Forms', blurb: 'A native select with the look of the theme.' },
    { tag: 'el-switch-field', category: 'Forms', blurb: 'A checkbox that reads as on or off.' },
    { tag: 'el-dialog', category: 'Overlays', blurb: 'A modal on the native dialog: focus, backdrop and Escape.' },
    { tag: 'el-drawer', category: 'Overlays', blurb: 'A panel that slides in from an edge of the viewport.' },
    { tag: 'el-popover', category: 'Overlays', blurb: 'A panel that floats next to its anchor.' },
    { tag: 'el-tooltip', category: 'Overlays', blurb: 'A text that explains its anchor, on hover and on focus.' },
    { tag: 'el-notification', category: 'Feedback', blurb: 'An alert with variants and a live region.' },
    { tag: 'el-toast', category: 'Feedback', blurb: 'The region where toasts appear, and leave again.' },
    { tag: 'el-spinner', category: 'Feedback', blurb: 'For a wait of unknown length.' },
    {
        tag: 'el-progress-bar',
        category: 'Feedback',
        blurb: 'A track that fills with the progress of a task.',
        fresh: true,
    },
    { tag: 'el-progress-ring', category: 'Feedback', blurb: 'The same progress, in a ring.', fresh: true },
    { tag: 'el-skeleton', category: 'Feedback', blurb: 'A shape in the place of what still loads.' },
    { tag: 'el-empty-state', category: 'Feedback', blurb: 'A message where a list is empty.' },
    { tag: 'el-tab-group', category: 'Navigation', blurb: 'Tabs and their panels, with the arrow keys.' },
    { tag: 'el-accordion', category: 'Navigation', blurb: 'A section that opens and closes.' },
    { tag: 'el-dropdown', category: 'Navigation', blurb: 'A menu behind a trigger.' },
    { tag: 'el-pagination', category: 'Navigation', blurb: 'The way through a list in pages.' },
    { tag: 'el-breadcrumb', category: 'Navigation', blurb: 'The trail from the start page to this one.', fresh: true },
    { tag: 'el-card', category: 'Surfaces', blurb: 'A surface that groups what belongs together.' },
    { tag: 'el-avatar', category: 'Surfaces', blurb: 'An image, initials or an icon for a person.' },
    { tag: 'el-badge', category: 'Surfaces', blurb: 'A label for a status or a count.' },
    { tag: 'el-tag', category: 'Surfaces', blurb: 'A label for a keyword or a filter, removable.' },
    { tag: 'el-divider', category: 'Surfaces', blurb: 'A line between two groups of content.', fresh: true },
];

const PER_PAGE = 6;
const LOAD_TIME = 1200;

// Two letters for the tile of a component: "el-empty-state" is "ES", "el-card" is "CA".
const initialsOf = (tag) => {
    const words = tag.slice(3).split('-');
    return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
};

// The header and the footer of a card place what is slotted into them: the name at the start and the
// badge at the end, the tag at the start and the button at the end.
const kitCard = (item) => html`
    <li>
        <el-card style="height:100%">
            <span slot="header" class="flex items-center gap-3">
                <el-avatar shape="rounded" size="small" initials="${initialsOf(item.tag)}"></el-avatar>
                <h3 class="font-semibold"><code>${item.tag}</code></h3>
            </span>
            ${item.fresh ? html`<el-badge slot="header" variant="success">New</el-badge>` : ''}
            <p class="text-sm opacity-80">${item.blurb}</p>
            <el-tag slot="footer" size="small" appearance="outlined">${item.category}</el-tag>
            <el-button
                slot="footer"
                size="small"
                appearance="plain"
                style="margin-inline-start:auto"
                aria-label="Details of ${item.tag}"
                data-details="${item.tag}"
            >
                Details
            </el-button>
        </el-card>
    </li>
`;

// The same card while the list loads: a shape for the tile, the name, two lines and the tag.
const kitSkeleton = () => html`
    <li>
        <el-card style="height:100%">
            <el-skeleton slot="header" effect="sheen" style="width:2rem;height:2rem;flex:none"></el-skeleton>
            <el-skeleton slot="header" effect="sheen" style="width:45%;margin-inline-end:auto"></el-skeleton>
            <div class="grid gap-2">
                <el-skeleton effect="sheen"></el-skeleton>
                <el-skeleton effect="sheen" style="width:80%"></el-skeleton>
            </div>
            <span slot="footer" class="flex items-center" style="flex:1;min-height:2rem">
                <el-skeleton effect="sheen" style="width:30%"></el-skeleton>
            </span>
        </el-card>
    </li>
`;

/**
 * The list of the kit: what a page writes itself around the components. It holds the state (the
 * page, the categories that are shown, the order, whether it loads, the entry of the drawer) and
 * listens to the events of the components.
 */
class DemoKitBrowser extends TemplateElement {
    properties() {
        return {
            page: 1,
            shown: [...categories],
            sort: 'category',
            loading: false,
            selected: null,
        };
    }

    disconnected() {
        clearTimeout(this._loadTimer);
    }

    events() {
        return {
            this: {
                'tag-remove': (event) =>
                    this._setShown(this.shown.filter((name) => name !== event.target.dataset.category)),
                'pagination-change': (event) => {
                    this.page = event.detail.page;
                },
            },
            '[data-show]': {
                click: (event) => {
                    this.querySelector('el-popover').hide();
                    // In the order of the categories, wherever the one that comes back was.
                    const shown = [...this.shown, event.currentTarget.dataset.show];
                    this._setShown(categories.filter((name) => shown.includes(name)));
                },
            },
            '[data-reset]': { click: () => this._setShown([...categories]) },
            '[data-reload]': { click: () => this._reload() },
            '[data-sort]': {
                click: (event) => {
                    this.sort = event.currentTarget.dataset.sort;
                    this.page = 1;
                },
            },
            // An entry of the breadcrumb in the drawer leads back into the list: to the whole kit, or
            // to the one category. The link itself only says where that is.
            '[data-crumb]': {
                click: async (event) => {
                    event.preventDefault();
                    const only = event.currentTarget.dataset.crumb;
                    // First the drawer, which gives the focus back when it has closed. Then the
                    // filter, which takes it.
                    await this.querySelector('el-drawer').hide();
                    this._setShown(only === 'all' ? [...categories] : [only]);
                },
            },
            '[data-details]': {
                click: (event) => {
                    this.selected = kit.find((item) => item.tag === event.currentTarget.dataset.details);
                    this.querySelector('el-drawer').show();
                },
            },
            '[data-done]': { click: () => this.querySelector('el-drawer').hide() },
        };
    }

    afterUpdate() {
        // The control that was pressed is gone with the change of the filter (the remove button of a
        // tag, an entry of the popover, the button of the empty state): the focus goes to the button
        // that brings a category back.
        if (!this._focusFilter) return;
        this._focusFilter = false;
        this.querySelector('[data-filter]').focus();
    }

    /** @private */
    _setShown(shown) {
        this._focusFilter = true;
        this.shown = shown;
        this.page = 1;
    }

    /**
     * Stands for a request to a server.
     * @private
     */
    _reload() {
        if (this.loading) return;
        this.loading = true;
        this._loadTimer = setTimeout(() => {
            this.loading = false;
        }, LOAD_TIME);
    }

    /** @private */
    _list(items) {
        if (this.loading) {
            return html`
                <ul role="list" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
                    ${Array.from({ length: PER_PAGE }, kitSkeleton)}
                </ul>
            `;
        }
        if (items.length === 0) {
            return html`
                <el-empty-state>
                    <el-svg-use
                        slot="icon"
                        name="icon-layers"
                        spritePath=""
                        style="display:inline-block;width:3rem;height:3rem"
                    ></el-svg-use>
                    <h3 slot="heading" class="text-lg font-semibold">Nothing to show</h3>
                    Every category is hidden. Bring one back, or show them all.
                    <el-button slot="action" variant="brand" data-reset>Show every category</el-button>
                </el-empty-state>
            `;
        }
        const first = (this.page - 1) * PER_PAGE;
        return html`
            <ul role="list" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${items.slice(first, first + PER_PAGE).map(kitCard)}
            </ul>
        `;
    }

    template() {
        const shown = kit.filter((item) => this.shown.includes(item.category));
        const items = this.sort === 'name' ? [...shown].sort((a, b) => a.tag.localeCompare(b.tag)) : shown;
        const hidden = categories.filter((name) => !this.shown.includes(name));
        const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
        const selected = this.selected;
        // The order that is chosen is the filled button of the group, and the one that is pressed.
        const sortButton = (sort, text) => html`
            <el-button
                size="small"
                variant="${this.sort === sort ? 'brand' : 'neutral'}"
                appearance="${this.sort === sort ? 'filled' : 'outlined'}"
                aria-pressed="${this.sort === sort ? 'true' : 'false'}"
                data-sort="${sort}"
            >
                ${text}
            </el-button>
        `;

        return html`
            <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div class="flex items-center gap-3">
                    <h2 class="text-2xl font-bold">Browse the kit</h2>
                    <el-badge variant="brand" pill="true">${items.length} components</el-badge>
                    <el-progress-ring
                        value="${items.length}"
                        max="${kit.length}"
                        label="Share of the kit that is shown"
                        style="--el-progress-ring-size:1.75rem;--el-progress-ring-track-width:0.25rem"
                    ></el-progress-ring>
                </div>
                <div class="flex items-center gap-3">
                    <el-button-group label="Order of the list">
                        ${sortButton('category', 'By category')} ${sortButton('name', 'A to Z')}
                    </el-button-group>
                    <el-divider orientation="vertical"></el-divider>
                    <el-button
                        id="demo-kit-reload"
                        appearance="outlined"
                        circle="true"
                        aria-label="Reload the list"
                        data-reload
                    >
                        ↻
                    </el-button>
                </div>
                <el-tooltip for="demo-kit-reload" placement="left">Asks the server for the list again</el-tooltip>
            </div>
            <p class="opacity-70 mb-4 text-sm">
                A part of what is in the box. Hide a category, or look at the details.
            </p>

            <div class="flex flex-wrap items-center gap-2 mb-6">
                <span class="text-sm opacity-70">Showing</span>
                ${this.shown.map(
                    (name) =>
                        html`<el-tag removable="true" remove-label="Hide" data-category="${name}">${name}</el-tag>`,
                )}
                <el-popover placement="bottom-start" arrow="true">
                    <el-button slot="anchor" size="small" appearance="plain" caret="true" data-filter>
                        Add a category
                    </el-button>
                    <div class="grid gap-1 text-sm" style="min-width:10rem">
                        ${
                            hidden.length === 0
                                ? html`<p class="opacity-70">Every category is shown.</p>`
                                : hidden.map(
                                      (name) =>
                                          html`<el-button size="small" appearance="plain" data-show="${name}">
                                              ${name}
                                          </el-button>`,
                                  )
                        }
                    </div>
                </el-popover>
                ${
                    this.loading
                        ? html`<span class="flex items-center gap-2 text-sm" style="margin-inline-start:auto">
                              <el-spinner label="Loading the components"></el-spinner>
                              <span class="opacity-70" aria-hidden="true">Loading the components…</span>
                          </span>`
                        : ''
                }
            </div>

            <el-progress-bar
                class="block mb-4"
                style="--el-progress-bar-height:0.25rem"
                label="Place in the list"
                value="${items.length === 0 ? 0 : this.page}"
                max="${pages}"
                indeterminate="${this.loading}"
            ></el-progress-bar>
            ${this._list(items)}
            ${
                items.length > PER_PAGE
                    ? html`<el-pagination
                          class="block mt-6"
                          label="Pages of the kit"
                          page="${this.page}"
                          total="${items.length}"
                          per-page="${PER_PAGE}"
                      ></el-pagination>`
                    : ''
            }

            <el-drawer label="${selected ? selected.tag : 'Details'}">
                ${
                    selected
                        ? html`
                              <el-breadcrumb label="Place in the kit" class="block mb-4 text-sm">
                                  <el-breadcrumb-item href="#kit" data-crumb="all">Kit</el-breadcrumb-item>
                                  <el-breadcrumb-item href="#kit" data-crumb="${selected.category}">
                                      ${selected.category}
                                  </el-breadcrumb-item>
                                  <el-breadcrumb-item current="true">${selected.tag}</el-breadcrumb-item>
                              </el-breadcrumb>
                              <p class="opacity-80">${selected.blurb}</p>
                              <el-divider class="my-4"></el-divider>
                              <dl class="grid gap-3 text-sm">
                                  <div>
                                      <dt class="font-semibold mb-1">Category</dt>
                                      <dd><el-tag size="small">${selected.category}</el-tag></dd>
                                  </div>
                                  <div>
                                      <dt class="font-semibold mb-1">Import</dt>
                                      <dd class="flex items-center gap-2">
                                          <code id="demo-kit-import" style="overflow-wrap:anywhere"
                                              >@webtides/element-library/${selected.tag.slice(3)}/define</code
                                          >
                                          <el-copy-button
                                              from="demo-kit-import"
                                              size="small"
                                              label="Copy the import path"
                                              style="flex:none"
                                          ></el-copy-button>
                                      </dd>
                                  </div>
                              </dl>
                          `
                        : ''
                }
                <el-button slot="footer" variant="brand" data-done>Done</el-button>
            </el-drawer>
        `;
    }
}

defineElement('demo-kit-browser', DemoKitBrowser);

// The page chrome: sticky header (brand + nav + dropdown), main, footer, scroll-to-top.
const page = ({ brandIcon, brandName, footerNote, nav, dropdownLabel, dropdownItems, children }) => html`
    <div style="min-height:100vh;background:var(--el-color-bg,#fff);color:var(--el-color-fg,#111)">
        ${sprite}

        <style>
            /* Float the dropdown's themed panel as an overlay instead of pushing the header taller. */
            el-dropdown::part(panel) {
                position: absolute;
                right: 0;
                margin-top: 0.5rem;
                z-index: 50;
            }

            /* The pages of the kit stand in the middle below the list. */
            demo-kit-browser el-pagination::part(list) {
                justify-content: center;
            }
        </style>

        <!-- ───────── Sticky header with dropdown menu ───────── -->
        <el-sticky>
            <header
                class="w-full border-b"
                style="border-color:var(--el-color-border,#e5e7eb);background:var(--el-color-bg,#fff)"
            >
                <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <a class="flex items-center gap-2 font-bold text-lg" href="#top">${icon(brandIcon)} ${brandName}</a>

                    <nav class="hidden sm:flex items-center gap-6 text-sm">${nav}</nav>

                    <el-dropdown open="false">
                        <div slot="trigger">
                            <button
                                type="button"
                                class="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                                style="border-color:var(--el-color-border,#d1d5db)"
                            >
                                ${icon('icon-user')} ${dropdownLabel}
                            </button>
                        </div>
                        <div slot="content" class="grid gap-1 text-sm w-44">${dropdownItems.map(dropdownItem)}</div>
                    </el-dropdown>
                </div>
            </header>
        </el-sticky>

        <main id="top" class="max-w-5xl mx-auto px-4">${children}</main>

        <footer class="border-t mt-8" style="border-color:var(--el-color-border,#e5e7eb)">
            <div class="max-w-5xl mx-auto px-4 py-8 text-sm opacity-70 flex items-center gap-2">
                ${icon(brandIcon)} ${footerNote}
            </div>
        </footer>

        ${scrollTopButton}
    </div>
`;

// ─────────────────────────────────────────────────────────────────────────────
// Design-system page (element-library) — leans into the theming/tokens story
// ─────────────────────────────────────────────────────────────────────────────

const swatchSlide = (title, colors) => html`
    <div>
        <div
            class="border"
            style="border-radius:0.75rem;overflow:hidden;border-color:var(--el-color-border,#e5e7eb);height:18rem;display:flex;flex-direction:column"
        >
            <div style="display:flex;flex:1">
                ${colors.map((c) => html`<div style="flex:1;background:${c}"></div>`)}
            </div>
            <div class="font-semibold" style="padding:0.9rem 1.1rem;background:var(--el-color-bg,#fff)">${title}</div>
        </div>
    </div>
`;

const tokens = [
    { swatch: '#2563eb', name: 'Color', blurb: 'Semantic palettes for light, dark and high-contrast.' },
    { swatch: '#0f172a', name: 'Type', blurb: 'A modular scale from caption to display.' },
    { swatch: '#10b981', name: 'Space', blurb: 'One spacing rhythm across every component.' },
    { swatch: '#f59e0b', name: 'Radius', blurb: 'Consistent corners, from inputs to cards.' },
    { swatch: '#8b5cf6', name: 'Elevation', blurb: 'A small, deliberate set of shadows.' },
    { swatch: '#ef4444', name: 'Motion', blurb: 'Durations and easings that respect reduced-motion.' },
];

export const Page = {
    name: 'Example Page',
    render: () =>
        page({
            brandIcon: 'icon-grid',
            brandName: 'element-library',
            footerNote: '@webtides/element-library — design system demo',
            dropdownLabel: 'Resources',
            dropdownItems: ['Figma kit', 'Tokens (JSON)', 'Changelog', 'GitHub ↗'],
            nav: html`
                ${navLink('#features', 'Tokens')} ${navLink('#kit', 'Components')} ${navLink('#start', 'Get the kit')}
                ${navLink('#faq', 'FAQ')}
            `,
            children: html`
                <!-- ───────── Hero with swatch carousel ───────── -->
                <section class="py-12 text-center">
                    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">One system. Every surface.</h1>
                    <p class="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                        A token-driven design system implemented as real web components with
                        <code>@webtides/element-library</code>. Theme it once, ship it everywhere.
                    </p>
                    <div class="flex items-center justify-center gap-3 flex-wrap">
                        <el-scroll-to selector="#start">
                            <el-button variant="brand" size="large">Get the kit</el-button>
                        </el-scroll-to>

                        <!-- A modal built from the library itself: form-field + buttons inside el-dialog.
                             The trigger opens its adjacent dialog; the scrim + panel re-skin with the theme. -->
                        <span class="inline-block">
                            <el-button appearance="outlined" size="large" onclick="this.nextElementSibling.show()">
                                Book a walkthrough
                            </el-button>
                            <el-dialog label="Book a walkthrough">
                                <p class="opacity-80 mb-4">
                                    Pick a time and we'll walk your team through the tokens, components and theming
                                    workflow.
                                </p>
                                <el-input-field
                                    name="when"
                                    type="text"
                                    label="Preferred date"
                                    placeholder="Next Tuesday, 2pm"
                                ></el-input-field>
                                <el-button
                                    slot="footer"
                                    appearance="outlined"
                                    onclick="this.closest('el-dialog').hide()"
                                >
                                    Maybe later
                                </el-button>
                                <el-button slot="footer" variant="brand" onclick="this.closest('el-dialog').hide()">
                                    Confirm
                                </el-button>
                            </el-dialog>
                        </span>
                    </div>

                    <div class="mt-10 rounded-xl overflow-hidden">
                        <el-carousel>
                            ${swatchSlide('Brand', ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'])}
                            ${swatchSlide('Neutral', ['#0f172a', '#334155', '#64748b', '#cbd5e1', '#f1f5f9'])}
                            ${swatchSlide('Accent', ['#065f46', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'])}
                            <span slot="arrow-left" aria-hidden="true">‹</span>
                            <span slot="arrow-right" aria-hidden="true">›</span>
                        </el-carousel>
                    </div>
                </section>

                <!-- ───────── Token tabs ───────── -->
                <section id="features" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">What's in the system</h2>
                    <el-tab-group selected="tokens" link-selector="el-tab-link" panel-selector="el-tab-panel">
                        <div>
                            <el-tab-link for="tokens" active>Tokens</el-tab-link>
                            <el-tab-link for="components">Components</el-tab-link>
                            <el-tab-link for="patterns">Patterns</el-tab-link>
                        </div>

                        <el-tab-panel name="tokens" active>
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-palette')}
                                <p class="opacity-80">
                                    Color, type, space, radius, elevation and motion as CSS custom properties. Flip the
                                    <strong>Theme</strong> and <strong>Color scheme</strong> switches above to watch
                                    them cascade.
                                </p>
                            </div>
                        </el-tab-panel>
                        <el-tab-panel name="components">
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-grid')}
                                <p class="opacity-80">
                                    Every token resolves into real, accessible components — buttons, inputs, tabs,
                                    accordions — that look right in any theme out of the box.
                                </p>
                            </div>
                        </el-tab-panel>
                        <el-tab-panel name="patterns">
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-layers')}
                                <p class="opacity-80">
                                    Larger compositions — forms, navigation, galleries — documented as patterns so teams
                                    assemble pages instead of reinventing them.
                                </p>
                            </div>
                        </el-tab-panel>
                    </el-tab-group>
                </section>

                <!-- ───────── Token catalogue (slider) ───────── -->
                <section id="catalogue" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">The token catalogue</h2>
                    <el-slider items-to-show="3">
                        ${tokens.map(
                            (t) => html`
                                <div class="item px-2">
                                    <el-card style="height:100%">
                                        <div slot="media" style="height:5rem;background:${t.swatch}"></div>
                                        <h3 slot="header" class="font-semibold">${t.name}</h3>
                                        <p class="text-sm opacity-70">${t.blurb}</p>
                                    </el-card>
                                </div>
                            `,
                        )}
                    </el-slider>
                </section>

                <!-- ───────── The kit to browse (cards, filters, pagination, drawer) ───────── -->
                <section id="kit" class="py-12">
                    <demo-kit-browser></demo-kit-browser>
                </section>

                ${lazyGallery(
                    'Patterns in production',
                    html`These examples load lazily via <code>el-lazy-src</code> as the gallery scrolls into view.`,
                )}

                <!-- ───────── Request-access form ───────── -->
                <section id="start" class="py-12">
                    <h2 class="text-2xl font-bold mb-2">Request the kit</h2>
                    <p class="opacity-70 mb-4 text-sm">Tell us about your team and we'll send over access.</p>
                    <p class="flex items-center gap-2 mb-6 text-sm">
                        <el-avatar size="small" initials="MO"></el-avatar>
                        <span><strong>Mira Okafor</strong> from the design systems team answers within a day.</span>
                    </p>
                    <form
                        class="grid sm:grid-cols-2 gap-6 rounded-xl border p-6"
                        style="border-color:var(--el-color-border,#e5e7eb)"
                        onsubmit="event.preventDefault(); this.parentElement.querySelector('el-toast').toast(this.parentElement.querySelector('[data-demo-toast]').cloneNode(true));"
                    >
                        <el-input-field
                            name="name"
                            type="text"
                            label="Full name"
                            placeholder="Charles Eames"
                            required="true"
                            help-message="So we know who to greet."
                            error-message="Please enter your name."
                        ></el-input-field>

                        <el-input-field
                            name="email"
                            type="email"
                            label="Work email"
                            placeholder="charles@example.com"
                            required="true"
                            error-message="Please enter a valid email."
                        ></el-input-field>

                        <el-password-field
                            name="password"
                            label="Choose a password"
                            placeholder="••••••••"
                            required="true"
                            help-message="At least 8 characters."
                            error-message="Please choose a password."
                        ></el-password-field>

                        <el-select-field
                            name="team"
                            label="Team size"
                            placeholder="Choose a range"
                            required="true"
                            error-message="Please choose a range."
                            options="${JSON.stringify(['Just me', '2–10', '11–50', '50+'])}"
                        ></el-select-field>

                        <div>
                            <label class="block text-sm font-medium mb-1">Seats</label>
                            <el-amount-field name="seats" value="3" min="1" max="100"></el-amount-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-radio-field
                                name="billing"
                                label="Billing cycle"
                                value="annual"
                                required="true"
                                help-message="Annual saves two months."
                                .options="${[
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'annual', label: 'Annual' },
                                ]}"
                            ></el-radio-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-textarea-field
                                name="context"
                                label="What are you building?"
                                placeholder="A product UI, a marketing site, an internal toolkit…"
                                help-message="Optional — helps us tailor the onboarding."
                            ></el-textarea-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-switch-field
                                name="updates"
                                checked="true"
                                label="Email me occasional product updates"
                            ></el-switch-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-checkbox-field
                                name="terms"
                                required="true"
                                error-message="Please agree to the terms."
                                label="I agree to the design system license terms."
                            ></el-checkbox-field>
                        </div>

                        <div class="sm:col-span-2 flex flex-wrap gap-3">
                            <el-button type="submit" variant="brand" size="large"> Request access </el-button>
                            <el-button type="reset" appearance="plain" size="large"> Start over </el-button>
                        </div>
                    </form>

                    <!-- Toast template: submitting the form clones this and shows the copy in the region. -->
                    <el-notification data-demo-toast variant="success" closable="true" duration="4000">
                        Thanks! We'll be in touch shortly.
                    </el-notification>
                    <el-toast></el-toast>
                </section>

                <!-- ───────── FAQ accordion ───────── -->
                <section id="faq" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">Frequently asked</h2>
                    <el-accordion-group show-multiple="false">
                        <el-accordion open="true">
                            <div slot="header" class="font-medium">How does theming work?</div>
                            <div slot="content" class="opacity-80">
                                Every value is a CSS custom property. Swap a token set — or toggle light/dark and
                                high-contrast — and the whole system re-skins without touching component code.
                            </div>
                        </el-accordion>
                        <el-accordion open="false">
                            <div slot="header" class="font-medium">Can I export the tokens?</div>
                            <div slot="content" class="opacity-80">
                                Yes — tokens ship as JSON and CSS, and stay in sync with the Figma kit so design and
                                code never drift.
                            </div>
                        </el-accordion>
                        <el-accordion open="false">
                            <div slot="header" class="font-medium">Is it accessible?</div>
                            <div slot="content" class="opacity-80">
                                Components ship with keyboard and ARIA support, and the themes meet contrast targets —
                                including a dedicated high-contrast mode.
                            </div>
                        </el-accordion>
                    </el-accordion-group>
                </section>

                <!-- ───────── Reveal-on-toggle banner (transition-classes) ───────── -->
                <section class="py-12">
                    <el-transition-classes
                        show="true"
                        enter="transition duration-500"
                        enter-start="opacity-0 translate-y-4"
                        enter-end="opacity-100 translate-y-0"
                        class="block"
                    >
                        <div class="rounded-xl p-8 text-center" style="background:var(--el-color-surface,#f3f4f6)">
                            <p class="text-xl font-semibold mb-1">Theming is built in.</p>
                            <p class="opacity-70">
                                Flip the <strong>Theme</strong> and <strong>Color scheme</strong> switches in the
                                toolbar — this banner animates in via <code>el-transition-classes</code>.
                            </p>
                        </div>
                    </el-transition-classes>
                </section>
            `,
        }),
};

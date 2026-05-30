import { html } from '@webtides/element-js';

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
                    'dropdown resources menu, a hero carousel of palette swatches, token tabs, a token-catalogue ' +
                    'slider, a lazy-loaded pattern gallery, a request-access form built from the field components, an ' +
                    'FAQ accordion, and the transition + scroll helpers. The design-system framing leans into the ' +
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
            <el-button variant="primary" circle="true" size="large" aria-label="Scroll to top"> ↑ </el-button>
        </el-scroll-to-top>
    </div>
`;

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
                ${navLink('#features', 'Tokens')} ${navLink('#catalogue', 'Components')}
                ${navLink('#start', 'Get the kit')} ${navLink('#faq', 'FAQ')}
            `,
            children: html`
                <!-- ───────── Hero with swatch carousel ───────── -->
                <section class="py-12 text-center">
                    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">One system. Every surface.</h1>
                    <p class="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                        A token-driven design system implemented as real web components with
                        <code>@webtides/element-library</code>. Theme it once, ship it everywhere.
                    </p>
                    <el-scroll-to selector="#start">
                        <el-button variant="primary" size="large">Get the kit</el-button>
                    </el-scroll-to>

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
                        <el-tab-link for="tokens" active>Tokens</el-tab-link>
                        <el-tab-link for="components">Components</el-tab-link>
                        <el-tab-link for="patterns">Patterns</el-tab-link>

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
                                    <div
                                        class="rounded-lg border overflow-hidden h-full"
                                        style="border-color:var(--el-color-border,#e5e7eb);background:var(--el-color-surface,#fff)"
                                    >
                                        <div style="height:5rem;background:${t.swatch}"></div>
                                        <div class="p-4">
                                            <div class="font-semibold mb-1">${t.name}</div>
                                            <div class="text-sm opacity-70">${t.blurb}</div>
                                        </div>
                                    </div>
                                </div>
                            `,
                        )}
                    </el-slider>
                </section>

                ${lazyGallery(
                    'Patterns in production',
                    html`These examples load lazily via <code>el-lazy-src</code> as the gallery scrolls into view.`,
                )}

                <!-- ───────── Request-access form ───────── -->
                <section id="start" class="py-12">
                    <h2 class="text-2xl font-bold mb-2">Request the kit</h2>
                    <p class="opacity-70 mb-6 text-sm">Tell us about your team and we'll send over access.</p>
                    <form
                        class="grid sm:grid-cols-2 gap-6 rounded-xl border p-6"
                        style="border-color:var(--el-color-border,#e5e7eb)"
                        onsubmit="return false"
                    >
                        <el-input-field
                            name="name"
                            type="text"
                            label="Full name"
                            placeholder="Charles Eames"
                            required="true"
                            help-message="So we know who to greet."
                        ></el-input-field>

                        <el-input-field
                            name="email"
                            type="email"
                            label="Work email"
                            placeholder="charles@example.com"
                            required="true"
                            error-message="Please enter a valid email."
                        ></el-input-field>

                        <el-select-field
                            name="team"
                            label="Team size"
                            placeholder="Choose a range"
                            required="true"
                            options="${JSON.stringify(['Just me', '2–10', '11–50', '50+'])}"
                        ></el-select-field>

                        <div>
                            <label class="block text-sm font-medium mb-1">Seats</label>
                            <el-amount-field name="seats" value="3" min="1" max="100"></el-amount-field>
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
                            <el-checkbox-field
                                name="terms"
                                required="true"
                                label="I agree to the design system license terms."
                            ></el-checkbox-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-button type="submit" variant="primary" size="large"> Request access </el-button>
                        </div>
                    </form>
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

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
                    'A single, somewhat realistic page — a fictional outdoor-gear shop — that wires up every ' +
                    'component in the library the way they tend to be used together: a sticky header with a ' +
                    'dropdown account menu, a hero carousel, feature tabs, a product slider, a booking form built ' +
                    'from the field components, an FAQ accordion, and the scroll helpers. Flip the **Theme** and ' +
                    '**Color scheme** toolbar switches to see the whole page re-skin through the design tokens.',
            },
        },
    },
};

// An inline SVG sprite so <el-svg-use> has symbols to reference (spritePath="" → embedded symbols).
const sprite = html`
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
        <symbol id="icon-compass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="icon-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </symbol>
        <symbol id="icon-tent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3 2 20h20L12 3z" />
            <path d="M12 9v11" />
        </symbol>
        <symbol id="icon-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
            <path d="M9 4v14M15 6v14" />
        </symbol>
        <symbol id="icon-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 20c8 2 16-4 16-16C8 2 2 12 4 20z" />
            <path d="M4 20C8 14 12 12 18 10" />
        </symbol>
    </svg>
`;

const icon = (name) =>
    html`<el-svg-use
        name="${name}"
        spritePath=""
        style="display:inline-block;width:1.5rem;height:1.5rem"
    ></el-svg-use>`;

const photos = [
    'photo-1469474968028-56623f02e42e',
    'photo-1551632811-561732d1e306',
    'photo-1454496522488-7a8e488e8606',
    'photo-1426604966848-d7adac402bff',
    'photo-1500530855697-b586d89ba3ee',
    'photo-1464822759023-fed622ff2c3b',
];

const unsplash = (id, w = 900) => `https://images.unsplash.com/${id}?ixlib=rb-1.2.1&auto=format&fit=crop&w=${w}&q=70`;

export const Page = {
    name: 'Example Page',
    render: () => html`
        <div style="min-height:100vh;background:var(--el-color-bg,#fff);color:var(--el-color-fg,#111)">
            ${sprite}

            <style>
                /* Float the dropdown's themed panel as an overlay instead of pushing the header taller. */
                el-dropdown-element::part(panel) {
                    position: absolute;
                    right: 0;
                    margin-top: 0.5rem;
                    z-index: 50;
                }
            </style>

            <!-- ───────── Sticky header with dropdown account menu ───────── -->
            <el-sticky-element>
                <header
                    class="w-full border-b"
                    style="border-color:var(--el-color-border,#e5e7eb);background:var(--el-color-bg,#fff)"
                >
                    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                        <a class="flex items-center gap-2 font-bold text-lg" href="#top">
                            ${icon('icon-compass')} Northwind Outfitters
                        </a>

                        <nav class="hidden sm:flex items-center gap-6 text-sm">
                            <el-scroll-to selector="#features"
                                ><a class="cursor-pointer hover:underline">Features</a></el-scroll-to
                            >
                            <el-scroll-to selector="#gear"
                                ><a class="cursor-pointer hover:underline">Gear</a></el-scroll-to
                            >
                            <el-scroll-to selector="#book"
                                ><a class="cursor-pointer hover:underline">Book a trip</a></el-scroll-to
                            >
                            <el-scroll-to selector="#faq"
                                ><a class="cursor-pointer hover:underline">FAQ</a></el-scroll-to
                            >
                        </nav>

                        <el-dropdown-element open="false">
                            <div slot="trigger">
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                                    style="border-color:var(--el-color-border,#d1d5db)"
                                >
                                    ${icon('icon-user')} Account
                                </button>
                            </div>
                            <!--
                                The component's own part="panel" is the flyout surface (themed:
                                bg, border, radius, shadow); we just position it via ::part above.
                            -->
                            <div slot="content" class="grid gap-1 text-sm w-44">
                                <a class="block px-3 py-1.5 rounded hover:opacity-70 cursor-pointer" role="menuitem"
                                    >My trips</a
                                >
                                <a class="block px-3 py-1.5 rounded hover:opacity-70 cursor-pointer" role="menuitem"
                                    >Wishlist</a
                                >
                                <a class="block px-3 py-1.5 rounded hover:opacity-70 cursor-pointer" role="menuitem"
                                    >Settings</a
                                >
                                <a class="block px-3 py-1.5 rounded hover:opacity-70 cursor-pointer" role="menuitem"
                                    >Sign out</a
                                >
                            </div>
                        </el-dropdown-element>
                    </div>
                </header>
            </el-sticky-element>

            <main id="top" class="max-w-5xl mx-auto px-4">
                <!-- ───────── Hero with carousel ───────── -->
                <section class="py-12 text-center">
                    <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Trails worth the detour.</h1>
                    <p class="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                        Guided backcountry trips and the gear to get you there. Built with
                        <code>@webtides/element-library</code> web components.
                    </p>
                    <el-scroll-to selector="#book">
                        <button
                            class="rounded-md px-6 py-3 font-semibold text-white"
                            style="background:var(--el-color-accent,#2563eb)"
                        >
                            Plan your trip
                        </button>
                    </el-scroll-to>

                    <div
                        class="mt-10 rounded-xl overflow-hidden border"
                        style="border-color:var(--el-color-border,#e5e7eb)"
                    >
                        <el-carousel-element>
                            ${photos.slice(0, 4).map(
                                (id) => html`
                                    <div>
                                        <img
                                            src="${unsplash(id, 1200)}"
                                            alt="Featured destination"
                                            class="w-full h-72 object-cover"
                                            width="1200"
                                            height="288"
                                        />
                                    </div>
                                `,
                            )}
                            <span slot="arrow-left" aria-hidden="true">‹</span>
                            <span slot="arrow-right" aria-hidden="true">›</span>
                        </el-carousel-element>
                    </div>
                </section>

                <!-- ───────── Feature tabs ───────── -->
                <section id="features" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">Why book with us</h2>
                    <el-tab-group selected="guides" link-selector="el-tab-link" panel-selector="el-tab-panel">
                        <el-tab-link for="guides" active>Expert guides</el-tab-link>
                        <el-tab-link for="gear">Premium gear</el-tab-link>
                        <el-tab-link for="impact">Low impact</el-tab-link>

                        <el-tab-panel name="guides" active>
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-map')}
                                <p class="opacity-80">
                                    Every trip is led by certified local guides who know the terrain, the weather
                                    windows, and the quiet spots the maps leave out.
                                </p>
                            </div>
                        </el-tab-panel>
                        <el-tab-panel name="gear">
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-tent')}
                                <p class="opacity-80">
                                    Tents, packs, and layers from our rental fleet are included and replaced every
                                    season, so you carry less and travel lighter.
                                </p>
                            </div>
                        </el-tab-panel>
                        <el-tab-panel name="impact">
                            <div class="flex items-start gap-3 pt-4">
                                ${icon('icon-leaf')}
                                <p class="opacity-80">
                                    Small groups, leave-no-trace itineraries, and carbon-offset transfers keep the
                                    places we love worth coming back to.
                                </p>
                            </div>
                        </el-tab-panel>
                    </el-tab-group>
                </section>

                <!-- ───────── Gear slider (CSS-only) ───────── -->
                <section id="gear" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">Featured gear</h2>
                    <el-slider-element items-to-show="3">
                        ${photos.map(
                            (id, i) => html`
                                <div class="item px-2">
                                    <div
                                        class="rounded-lg overflow-hidden border"
                                        style="border-color:var(--el-color-border,#e5e7eb)"
                                    >
                                        <img
                                            src="${unsplash(id, 600)}"
                                            alt="Gear item ${i + 1}"
                                            class="w-full h-40 object-cover"
                                            width="600"
                                            height="160"
                                        />
                                        <div class="p-3">
                                            <div class="font-semibold">Trail Item ${i + 1}</div>
                                            <div class="text-sm opacity-70">From €${49 + i * 20}</div>
                                        </div>
                                    </div>
                                </div>
                            `,
                        )}
                    </el-slider-element>
                </section>

                <!-- ───────── Trip gallery (lazy-loaded) ───────── -->
                <section id="gallery" class="py-12">
                    <h2 class="text-2xl font-bold mb-2">From past trips</h2>
                    <p class="opacity-70 mb-6 text-sm">
                        These images use <code>el-lazy-src</code> — scroll down and watch them load as they enter view.
                    </p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        ${[...photos, ...photos].map(
                            (id, i) => html`
                                <el-lazy-src
                                    class="block rounded-lg overflow-hidden border"
                                    style="border-color:var(--el-color-border,#e5e7eb)"
                                >
                                    <img
                                        data-src="${unsplash(id, 500)}"
                                        alt="Trip photo ${i + 1}"
                                        class="w-full h-40 object-cover"
                                        width="500"
                                        height="160"
                                    />
                                </el-lazy-src>
                            `,
                        )}
                    </div>
                </section>

                <!-- ───────── Booking form ───────── -->
                <section id="book" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">Plan your trip</h2>
                    <form
                        class="grid sm:grid-cols-2 gap-6 rounded-xl border p-6"
                        style="border-color:var(--el-color-border,#e5e7eb)"
                        onsubmit="return false"
                    >
                        <el-input-field
                            name="name"
                            type="text"
                            label="Full name"
                            placeholder="Jane Hiker"
                            required="true"
                            help-message="As it appears on your ID."
                        ></el-input-field>

                        <el-input-field
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="jane@example.com"
                            required="true"
                            error-message="Please enter a valid email."
                        ></el-input-field>

                        <el-select-field
                            name="destination"
                            label="Destination"
                            placeholder="Choose a route"
                            required="true"
                            options="${JSON.stringify([
                                'Dolomites Traverse',
                                'Lofoten Ridgeline',
                                'Patagonia Circuit',
                                'Atlas Foothills',
                            ])}"
                        ></el-select-field>

                        <div>
                            <label class="block text-sm font-medium mb-1">Travellers</label>
                            <el-amount-field name="travellers" value="2" min="1" max="12"></el-amount-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-textarea-field
                                name="notes"
                                label="Anything we should know?"
                                placeholder="Dietary needs, experience level, fitness…"
                                help-message="Optional, but it helps us match you to a guide."
                            ></el-textarea-field>
                        </div>

                        <div class="sm:col-span-2">
                            <el-checkbox-field
                                name="terms"
                                required="true"
                                label="I agree to the booking terms and cancellation policy."
                            ></el-checkbox-field>
                        </div>

                        <div class="sm:col-span-2">
                            <button
                                type="submit"
                                class="rounded-md px-6 py-3 font-semibold text-white"
                                style="background:var(--el-color-accent,#2563eb)"
                            >
                                Request booking
                            </button>
                        </div>
                    </form>
                </section>

                <!-- ───────── FAQ accordion ───────── -->
                <section id="faq" class="py-12">
                    <h2 class="text-2xl font-bold mb-6">Frequently asked</h2>
                    <el-accordion-group show-multiple="false">
                        <el-accordion-element open="true">
                            <div slot="header" class="font-medium">How fit do I need to be?</div>
                            <div slot="content" class="opacity-80">
                                Most trips assume you can comfortably walk 5–6 hours with a daypack. Each route lists a
                                difficulty rating, and our guides adjust the pace to the group.
                            </div>
                        </el-accordion-element>
                        <el-accordion-element open="false">
                            <div slot="header" class="font-medium">What's included in the price?</div>
                            <div slot="content" class="opacity-80">
                                Guiding, shared gear, permits, and in-trip transfers. Flights to the trailhead region
                                are not included.
                            </div>
                        </el-accordion-element>
                        <el-accordion-element open="false">
                            <div slot="header" class="font-medium">Can I cancel?</div>
                            <div slot="content" class="opacity-80">
                                Full refund up to 30 days before departure, 50% up to 14 days. After that the slot is
                                yours to transfer.
                            </div>
                        </el-accordion-element>
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
                            <p class="text-xl font-semibold mb-1">Off-season trips are 20% off.</p>
                            <p class="opacity-70">This banner animates in via <code>el-transition-classes</code>.</p>
                        </div>
                    </el-transition-classes>
                </section>
            </main>

            <footer class="border-t mt-8" style="border-color:var(--el-color-border,#e5e7eb)">
                <div class="max-w-5xl mx-auto px-4 py-8 text-sm opacity-70 flex items-center gap-2">
                    ${icon('icon-compass')} Northwind Outfitters — demo page for @webtides/element-library
                </div>
            </footer>

            <!-- ───────── Floating scroll-to-top ───────── -->
            <div style="position:fixed;right:1.5rem;bottom:1.5rem;z-index:50">
                <el-scroll-to-top duration="600">
                    <button
                        class="rounded-full w-12 h-12 shadow-lg text-white flex items-center justify-center"
                        style="background:var(--el-color-accent,#2563eb)"
                        aria-label="Scroll to top"
                    >
                        ↑
                    </button>
                </el-scroll-to-top>
            </div>
        </div>
    `,
};

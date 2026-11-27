import { html } from '@webtides/element-js';
import readme from './menu.readme.md?raw';
import { define } from './menu.js';
import { define as defineMenuItem } from '../menu-item/menu-item.js';
import { define as defineMenuGroup } from '../menu-group/menu-group.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDivider } from '../divider/divider.js';
define();
defineMenuItem();
defineMenuGroup();
defineButton();
defineDivider();

// Icons of the stories: decorations, the entries have their names. Each is a whole <svg>: a part
// of one that is put in from another template would be no part of the drawing.
const icon = (path, slot = 'icon') => html`
    <svg
        slot="${slot}"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="${path}" />
    </svg>
`;
const icons = {
    edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    copy: 'M9 9h10v10H9zM5 15V5h10',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
};

/** Says in the story what was chosen. */
const tell = (event) => {
    const out = event.currentTarget.parentElement.querySelector('[data-chosen]');
    if (out) out.textContent = `Chosen: ${event.detail.value || event.detail.item.textContent.trim()}`;
};

export default {
    title: 'Components/Menu',
    component: 'el-menu',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
            // A menu is in the top layer of its page: every story has a page of its own.
            story: { inline: false, height: '22rem' },
        },
    },
    args: {
        label: '',
        placement: 'bottom-start',
        distance: 4,
        open: false,
    },
    argTypes: {
        placement: {
            options: [
                'top',
                'top-start',
                'top-end',
                'bottom',
                'bottom-start',
                'bottom-end',
                'left',
                'left-start',
                'left-end',
                'right',
                'right-start',
                'right-end',
            ],
            control: { type: 'select' },
        },
    },
};

export const Playground = {
    render: ({ label, placement, distance, open }) => html`
        <div style="padding:6rem 8rem">
            <el-menu
                label="${label}"
                placement="${placement}"
                distance="${distance}"
                open="${open ? 'true' : 'false'}"
                @menu-select="${tell}"
            >
                <el-button slot="trigger" caret="true">More</el-button>
                <el-menu-item value="edit">${icon(icons.edit)}Edit</el-menu-item>
                <el-menu-item value="duplicate">${icon(icons.copy)}Duplicate</el-menu-item>
                <el-menu-item value="delete" variant="danger">${icon(icons.trash)}Delete</el-menu-item>
            </el-menu>
            <p data-chosen role="status" style="margin:1rem 0 0;font-size:0.875rem">Nothing chosen yet</p>
        </div>
    `,
};

export const RowActions = {
    name: 'The actions of a row',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A button with an icon alone at the end of a row. Its name (`aria-label`) is the name of the menu as well. The menu is below the end of the button (`placement="bottom-end"`), and goes above it without room there.',
            },
        },
    },
    render: () => html`
        <div style="padding:1rem;max-width:28rem">
            ${['Invoice 12', 'Invoice 13', 'Invoice 14'].map(
                (name) => html`
                    <div
                        style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--el-color-border, currentColor)"
                    >
                        <span>${name}</span>
                        <el-menu placement="bottom-end" @menu-select="${tell}">
                            <el-button
                                slot="trigger"
                                circle="true"
                                appearance="plain"
                                aria-label="Actions for ${name.toLowerCase()}"
                                >${icon(icons.more, '')}</el-button
                            >
                            <el-menu-item value="edit ${name}">Edit</el-menu-item>
                            <el-menu-item value="duplicate ${name}">Duplicate</el-menu-item>
                            <el-menu-item value="delete ${name}" variant="danger">Delete</el-menu-item>
                        </el-menu>
                    </div>
                `,
            )}
        </div>
    `,
};

export const Groups = {
    name: 'Groups, with and without a heading',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An `el-menu-group` has a line over it and a heading where it has a `label`. The arrow keys move through the entries of all groups as through one row.',
            },
        },
    },
    render: () => html`
        <div style="padding:1rem">
            <el-menu open="true" @menu-select="${tell}">
                <el-button slot="trigger" caret="true">File</el-button>
                <el-menu-item value="open">Open</el-menu-item>
                <el-menu-item value="rename">Rename</el-menu-item>
                <el-menu-group label="Share">
                    <el-menu-item value="mail">${icon(icons.mail)}Mail</el-menu-item>
                    <el-menu-item value="link">${icon(icons.link)}Copy link</el-menu-item>
                </el-menu-group>
                <el-menu-group>
                    <el-menu-item value="delete" variant="danger">${icon(icons.trash)}Delete</el-menu-item>
                </el-menu-group>
            </el-menu>
            <p data-chosen role="status" style="margin:1rem 0 0;font-size:0.875rem"></p>
        </div>
    `,
};

export const LinksAndDisabled = {
    name: 'Links, and an entry that is disabled',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'An entry with `href` is a link the browser follows. An entry with `disabled="true"` cannot be chosen: the arrow keys still stop at it, and it says to a screen reader that it is not available.',
            },
        },
    },
    render: () => html`
        <div style="padding:1rem">
            <el-menu open="true" label="Account">
                <el-button slot="trigger" caret="true">ada@example.com</el-button>
                <el-menu-item href="#profile">Profile</el-menu-item>
                <el-menu-item href="#billing">Billing</el-menu-item>
                <el-menu-item value="team" disabled="true">Switch team</el-menu-item>
                <el-divider></el-divider>
                <el-menu-item value="logout">Log out</el-menu-item>
            </el-menu>
        </div>
    `,
};

export const InACorner = {
    name: 'Without room below',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The button is at the lower edge and at the end of the page. The menu goes above it, and stays inside of the viewport.',
            },
        },
    },
    render: () => html`
        <div style="position:fixed;inset:auto 0.5rem 0.5rem auto">
            <el-menu open="true">
                <el-button slot="trigger" caret="true">More</el-button>
                <el-menu-item value="edit">Edit this entry of the list</el-menu-item>
                <el-menu-item value="duplicate">Duplicate</el-menu-item>
                <el-menu-item value="delete" variant="danger">Delete</el-menu-item>
            </el-menu>
        </div>
    `,
};

export const RightToLeft = {
    name: 'In a right-to-left page',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'Start and end follow the reading direction: the menu is in line with the right edge of its button, and the icons are at the right of their texts.',
            },
        },
    },
    render: () => html`
        <div dir="rtl" style="padding:1rem 8rem">
            <el-menu open="true">
                <el-button slot="trigger" caret="true">المزيد</el-button>
                <el-menu-item value="edit">${icon(icons.edit)}تعديل</el-menu-item>
                <el-menu-item value="delete" variant="danger">${icon(icons.trash)}حذف</el-menu-item>
            </el-menu>
        </div>
    `,
};

/**
 * A long press of a finger, for a browser that has no `contextmenu` event for it: the pointer of
 * a touch that stays down for half a second without moving.
 * @param {HTMLElement} target
 * @param {(event: PointerEvent) => void} callback
 */
const onLongPress = (target, callback) => {
    let timer;
    let start;
    const cancel = () => clearTimeout(timer);
    target.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        start = event;
        cancel();
        timer = setTimeout(() => callback(start), 500);
    });
    target.addEventListener('pointermove', (event) => {
        if (start && Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 10) cancel();
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) target.addEventListener(type, cancel);
};

export const ManyRows = {
    name: 'One menu for the rows of a list',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'One `el-menu` without a button of its own, after the list. A right click on a row, or a long press of a finger, opens it where the pointer is: `menu.showAt({ x, y }, row)`. The button at the end of a row opens the same menu at the button: `menu.showAt(button)`, and a second press on it closes the menu. Nothing is in the menu of the right click alone. What the menu was opened for is `detail.opener` of `menu-select`, and gets the focus back.',
            },
            story: { inline: false, height: '26rem' },
        },
    },
    render: () => {
        setTimeout(() => {
            const list = document.querySelector('#rows-list');
            const menu = document.querySelector('#rows-menu');
            const out = document.querySelector('#rows-output');
            if (!list || list.dataset.wired) return;
            list.dataset.wired = 'true';

            const row = (node) => node.closest('[data-row]');
            list.addEventListener('contextmenu', (event) => {
                if (!row(event.target)) return;
                event.preventDefault();
                menu.showAt({ x: event.clientX, y: event.clientY }, row(event.target));
            });
            onLongPress(list, (event) => {
                if (row(event.target) && !menu.open)
                    menu.showAt({ x: event.clientX, y: event.clientY }, row(event.target));
            });
            list.addEventListener('click', (event) => {
                const button = event.target.closest('[aria-haspopup="menu"]');
                if (button) menu.showAt(button);
            });
            menu.addEventListener('menu-select', (event) => {
                const name = row(event.detail.opener).dataset.row;
                out.textContent = `${event.detail.item.textContent.trim()}: ${name}`;
            });
        });

        return html`
            <div style="padding:1rem;max-width:30rem">
                <ul id="rows-list" style="list-style:none;margin:0;padding:0">
                    ${['Release notes', 'Questions about the invoice', 'Room for the workshop', 'Next sprint'].map(
                        (name) => html`
                            <li
                                data-row="${name}"
                                tabindex="0"
                                style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.25rem 0 0.25rem 0.5rem;border-bottom:1px solid var(--el-color-border, currentColor);-webkit-touch-callout:none;-webkit-user-select:none;user-select:none"
                            >
                                <span>${name}</span>
                                <el-button
                                    circle="true"
                                    appearance="plain"
                                    aria-haspopup="menu"
                                    aria-label="Actions for ${name}"
                                    >${icon(icons.more, '')}</el-button
                                >
                            </li>
                        `,
                    )}
                </ul>
                <el-menu id="rows-menu" label="Actions" placement="bottom-end">
                    <el-menu-item value="read">Mark as read</el-menu-item>
                    <el-menu-item value="rename">${icon(icons.edit)}Rename</el-menu-item>
                    <el-menu-item value="move" disabled="true">Move</el-menu-item>
                    <el-menu-group>
                        <el-menu-item value="delete" variant="danger">${icon(icons.trash)}Delete</el-menu-item>
                    </el-menu-group>
                </el-menu>
                <p id="rows-output" role="status" style="margin:1rem 0 0;font-size:0.875rem">Nothing chosen yet</p>
            </div>
        `;
    },
};

export const EntriesThatComeLater = {
    name: 'Entries the page renders when the menu opens',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The menu is empty until it is asked for: the page renders its entries half a second after `menu-show`, as the answer of a server. The focus goes to the first entry once the entries are there, and the menu is placed again for its size. Until then `Escape` closes the menu, wherever the focus is.',
            },
        },
    },
    render: () => {
        setTimeout(() => {
            const menu = document.querySelector('#later-menu');
            if (!menu || menu.dataset.wired) return;
            menu.dataset.wired = 'true';

            const clear = () => {
                for (const child of [...menu.children]) if (!child.slot) child.remove();
            };
            menu.addEventListener('menu-show', () => {
                menu.insertAdjacentHTML('beforeend', '<div style="padding:0.5rem 0.75rem">Loading …</div>');
                setTimeout(() => {
                    if (!menu.open) return;
                    clear();
                    for (const name of ['Inbox', 'Archive', 'Read later']) {
                        const item = document.createElement('el-menu-item');
                        item.setAttribute('value', name.toLowerCase());
                        item.textContent = name;
                        menu.append(item);
                    }
                }, 500);
            });
            menu.addEventListener('menu-hide', clear);
        });

        return html`
            <div style="padding:1rem">
                <el-menu id="later-menu" @menu-select="${tell}">
                    <el-button slot="trigger" caret="true">Move to</el-button>
                </el-menu>
                <p data-chosen role="status" style="margin:1rem 0 0;font-size:0.875rem">Nothing chosen yet</p>
            </div>
        `;
    },
};

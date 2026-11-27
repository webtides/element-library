import { html } from '@webtides/element-js';

/**
 * What an option of a group of choices shows in front of its label: a dot in the colour the option
 * names (`color`), and an icon, the address of an SVG symbol (`icon`: `'#tag'`,
 * `'/icons.svg#tag'`), as an option of `el-segmented-field` has it.
 *
 * Both are decorations. The label is the name of the option, so what is in front of it is hidden
 * from assistive technology as a whole.
 *
 * Nothing for an option that has neither, a plain text among them: such an option has the markup
 * it had.
 * @param {string | { color?: string, icon?: string }} option
 * @returns {import('@webtides/element-js').TemplateResult | null}
 */
export function optionStartTemplate(option) {
    const color = option?.color;
    const icon = option?.icon;
    if (!color && !icon) return null;

    // Each drawing is a whole <svg>: a part of one that comes from another template would be no
    // part of the drawing.
    return html`
        <span class="option-start" aria-hidden="true">
            ${color ? html`<span class="option-color" style="--_el-option-color: ${color}"></span>` : null}
            ${
                icon
                    ? html`<svg class="option-icon" focusable="false">
                          <use href="${icon}"></use>
                      </svg>`
                    : null
            }
        </span>
    `;
}

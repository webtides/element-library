import { defineElement, html } from '@webtides/element-js';
import FormField from '@webtides/form-field';
import { ifDefined } from 'lit-html/directives/if-defined';
import style from './select-field.css';

export default class SelectField extends FormField {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
			...super.properties(),
			options: [], // ['string1', 'string2'] or [{value: 'value', label: 'label'}, ...]
		};
    }

	fieldTemplate() {
		return html`
            <select
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                value="${this.value}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                aria-describedby="${this.name}-help"
            >
                ${this.options.map(option => {
			return html`
                        <option
                            value=${ifDefined(option.value ?? undefined)}
                            ?selected=${option.selected && !!option.selected}
                        >
                            ${option.label ?? option}
                        </option>
                    `;
		})}
            </select>
            ${this.dropdownIndicatorTemplate()}
        `;
	}

	dropdownIndicatorTemplate() {
		return html` <div class="icon">&or;</div> `;
	}
}

export function define() {
	defineElement('select-field', SelectField);
}


import { html, defineElement } from '@webtides/element-js';
import FormField from '@webtides/form-field';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from 'lit-html/directives/class-map';
import style from './input-field.css';

export default class InputField extends FormField {
	constructor(options) {
		super({ shadowRender: false, styles: [style], ...options });
	}

	properties() {
		return {
			...super.properties(),
			type: 'text',
			placeholder: '',
			pattern: false,
		};
	}

	fieldTemplate() {
		const classes = { 'is-valid': !!this.valid, 'is-invalid': !this.valid };
		return html`
			<input
				ref="input"
				id="input-${this.name}"
				name="${this.name}"
				type="${this.type}"
				value="${this.value}"
				placeholder="${this.placeholder}"
				?required="${this.required}"
				?disabled="${this.disabled}"
				aria-describedby="${this.name}-help"
				pattern=${ifDefined(this.pattern ? this.pattern : undefined)}
			/>
			${this.touched
				? html`
						<div class="validity ${classMap(classes)}">
							${this.valid
								? html`
										<span class="valid h-4 w-4">&checkmark;</span>
								  `
								: html`
										<span class="invalid h-4 w-4" data-clear-input>&cross;</span>
								  `}
						</div>
				  `
				: ''}
		`;
	}
}

export function define() {
	defineElement('input-field', InputField);
}

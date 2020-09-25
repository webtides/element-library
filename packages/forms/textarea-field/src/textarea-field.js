import { html, defineElement } from '@webtides/element-js';
import FormField from '@webtides/form-field';
import { classMap } from 'lit-html/directives/class-map';
import style from './textarea-field.css';

export default class TextareaField extends FormField {
	constructor(options) {
		super({ shadowRender: false, styles: [style], ...options });
	}

	properties() {
		return {
			...super.properties(),
			placeholder: '',
			rows: 3,
		};
	}

	fieldTemplate() {
		const classes = { 'is-valid': !!this.valid, 'is-invalid': !this.valid };
		return html`
			<textarea
				ref="input"
				id="input-${this.name}"
				name="${this.name}"
				rows="${this.rows}"
				placeholder="${this.placeholder}"
				?required="${this.required}"
				?disabled="${this.disabled}"
				aria-describedby="${this.name}-help"
			>
${this.value}</textarea
			>
			${this.touched
				? html`
						<div class="validity ${classMap(classes)}">
							${this.valid
								? html` <span class="valid h-4 w-4">&checkmark;</span> `
								: html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `}
						</div>
				  `
				: ''}
		`;
	}
}

export function define() {
	defineElement('textarea-field', TextareaField);
}

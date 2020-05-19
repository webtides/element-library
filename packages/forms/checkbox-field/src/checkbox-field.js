import { html } from '@currentjs/element';
import { FormField, FormFieldEvents } from '@currentjs/element-library_forms_form-field';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { classMap } from 'lit-html/directives/class-map';
import style from './checkbox-field.css';

export default class CheckboxField extends FormField {
	uuid = Math.random().toString(36).substr(2, 5);

	constructor(options) {
		super({ shadowRender: false, styles: [style], ...options });
	}

	properties() {
		return {
			...super.properties(),
			checked: false,
		};
	}

	hooks() {
		return {
			connected: () => {
				this.setAttribute('checked', this.checked === true ? 'true' : 'false');
			},
		};
	}

	watch() {
		return {
			...super.watch(),
			checked: checked => {
				this.setAttribute('checked', checked ? 'true' : 'false');
				this.dispatch(FormFieldEvents.INPUT_CHANGE, this.$refs.input.value, true);
			},
		};
	}

	events() {
		return {
			...super.events(),
			input: {
				change: () => {
					this.checked = this.$refs.input.checked;
				},
			},
		};
	}

	fieldTemplate() {
		const classes = { 'is-checked': !!this.checked };
		return html`
			<label for="checkbox-${this.uuid}">
				<input
					ref="input"
					type="checkbox"
					id="checkbox-${this.uuid}"
					aria-describedby="checkbox-${this.uuid}"
					value="${this.value}"
					name="${this.name}"
					?disabled="${this.disabled}"
					?checked="${this.checked}"
					?required="${this.required}"
				/>
				<div class="checked-indicator ${classMap(classes)}">
					${this.selectedIndicatorTemplate()}
				</div>
				<div class="label">${unsafeHTML(this.label)}</div>
			</label>
		`;
	}

	selectedIndicatorTemplate() {
		return html` <div class="checked">&checkmark;</div> `;
	}
}


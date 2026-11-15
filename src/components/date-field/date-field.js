import { defineElement } from '@webtides/element-js';
import InputField from '../input-field/input-field.js';
import style from './date-field.style.js';

/**
 * A date, a time or both, entered in the control of the browser and picked in its picker. Extends
 * `InputField` (and therefore `FormField`), inheriting the label / help / error / validation
 * surface and the look from `styles/native.css`.
 *
 * It adds what a date needs and a text does not: the earliest and the latest value, and the step
 * between two values. The value is text in the one format of the control, whatever the language of
 * the user, and the field takes over what the control makes of a value: `value` says what the form
 * submits.
 *
 * @element el-date-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the value changes: entered, picked, or set
 *   by a script. `detail` is the new value. Bubbles.
 *
 * @property {'date'|'time'|'datetime-local'|'month'|'week'} type - What the field takes. Default
 *   `'date'`.
 * @property {string | null} value - The value, in the format of the control: `2026-11-15` for a
 *   date, `14:30` for a time, `2026-11-15T14:30` for both, `2026-11` for a month, `2026-W46` for a
 *   week. A value in another format is empty for the control, and the field takes that over.
 * @property {string | null} min - The earliest value, in the format of the control. `null` (the
 *   default) is no limit.
 * @property {string | null} max - The latest value, in the format of the control. `null` (the
 *   default) is no limit.
 * @property {number | 'any' | null} step - The distance between two values: days for a date, weeks
 *   for a week, months for a month, seconds for a time. `null` (the default) is the step of the
 *   browser: a day, a week, a month, a minute.
 */
export default class DateField extends InputField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            type: 'date',
            min: null,
            max: null,
            step: null,
        };
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset: what the field takes over from the
        // control is part of it.
        this._matchControl();
        super.afterUpdate();
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                this._matchControl();
                // The watcher runs a frame after the change, with the value of then. A value the
                // control did not take is not reported: the field has taken another one over by
                // now, and the watcher runs again for that one.
                if (String(value ?? '') !== String(this.value ?? '')) return;
                watchers.value(value, oldValue);
            },
        };
    }

    events() {
        const events = super.events();
        return {
            ...events,
            '[ref=input]': {
                ...events['[ref=input]'],
                // A pick in the picker presses no key that the field would hear.
                input: () => this.onChange(),
                // The control fires `change` with every value, not only when it is left. The
                // watcher of `value` reports each of them, so there is nothing to report here.
                change: () => this.onChange(),
            },
        };
    }

    /**
     * The control has a value once a date is complete, and none while the user is still entering
     * it. For a field without a value that is no change. It must not be one: an empty value is
     * written to the control as its default, and the control would drop what the user has entered
     * of the date so far, the very first key.
     */
    onChange() {
        const control = this.$refs.input;
        this._controlValue = control.value;
        if (control.value !== String(this.value ?? '')) this.value = control.value;
        this.valid = control.validity.valid;
    }

    /**
     * Makes the control and `value` say the same, after every render and every change of `value`.
     *
     * The `value` attribute of the control is only its default: once the user has entered a date,
     * a value from outside has to be written to the control. The control in turn takes a value in
     * its own format only and is empty for every other, `15.11.2026` for example, or a date for a
     * field that has become one for a time. The field takes over what the control made of the
     * value: that is what the form submits.
     *
     * The field hears every change the user makes (`input`), so the control never has a value of
     * the user that this would write over. While the two say the same nothing is written: the
     * control would drop a date that is half entered.
     * @private
     */
    _matchControl() {
        const control = this.$refs.input;
        if (!control) return;

        const wanted = String(this.value ?? '');
        if (control.value !== wanted) control.value = wanted;
        // What the control has is what the two agree on, so the input field does not write it again.
        this._controlValue = control.value;
        if (control.value !== wanted) this.value = control.value;
    }

    /**
     * The limits and the step, for the control. An empty one is none: a page that renders
     * `min=""` for "no limit" means the same as one that leaves the attribute out.
     * @private
     */
    _controlAttributes() {
        return { min: this.min || null, max: this.max || null, step: this.step || null };
    }
}

export function define() {
    defineElement('el-date-field', DateField);
}

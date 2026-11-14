import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './progress-bar.style.js';
import { progressOf } from '../../utils/progress.js';

/**
 * A progress bar: a track that fills with the progress of a task, an upload, an import, the steps
 * of a form. `value` of `max` says how far the task is. `indeterminate` is the bar for a task
 * whose progress is not known yet: a part of the track that moves, in the place where the bar with
 * a value will stand.
 *
 * @element el-progress-bar
 *
 * @csspart base - The track. It carries `role="progressbar"`, the value and the label.
 * @csspart indicator - The part of the track that is filled.
 *
 * @cssproperty --el-progress-bar-height - The height of the bar. Unset, it is `0.5rem`.
 * @cssproperty --el-progress-bar-indicator-color - The part that is filled. Unset, it is
 *   `--el-color-accent`, and the text colour without a theme.
 * @cssproperty --el-progress-bar-track-color - The track. Unset, it is a fifth of the text colour.
 *
 * @property {number} value - How far the task is, from `0` to `max`. A value outside of that range
 *   is shown as the nearest one inside. Default `0`.
 * @property {number} max - The value of a task that is done. Default `100`.
 * @property {boolean} indeterminate - The progress is not known: the bar has no value and a part
 *   of the track moves. Default `false`.
 * @property {string} label - The accessible name of the bar. Default `'Progress'`.
 */
export default class ProgressBar extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            value: 0,
            max: 100,
            indeterminate: false,
            label: 'Progress',
        };
    }

    template() {
        if (this.indeterminate) {
            // Without a value: that is how a progress of unknown length is exposed.
            return html`
                <div
                    part="base"
                    class="progress-bar progress-bar--indeterminate"
                    role="progressbar"
                    aria-label="${this.label}"
                >
                    <div part="indicator" class="indicator"></div>
                </div>
            `;
        }

        const { value, max, percent } = progressOf(this.value, this.max);

        return html`
            <div
                part="base"
                class="progress-bar"
                role="progressbar"
                aria-label="${this.label}"
                aria-valuemin="0"
                aria-valuemax="${max}"
                aria-valuenow="${value}"
            >
                <div part="indicator" class="indicator" style="${`width: ${percent}%`}"></div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-progress-bar', ProgressBar);
}

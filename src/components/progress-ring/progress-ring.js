import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './progress-ring.style.js';
import { progressOf } from '../../utils/progress.js';

/**
 * A progress ring: a ring that closes with the progress of a task, for a place with little room, a
 * tile of a dashboard, a card, the side of a heading. `value` of `max` says how far the task is,
 * and the middle of the ring has room for a short text. It speaks the vocabulary of the progress
 * bar; a wait of unknown length is a spinner.
 *
 * @element el-progress-ring
 *
 * @slot - A short text in the middle of the ring, "45 %". Not read out: the value is.
 *
 * @csspart base - The ring and its middle. It carries `role="progressbar"`, the value and the
 *   label.
 * @csspart track - The whole ring, a `<circle>`.
 * @csspart indicator - The part of the ring that is drawn, a `<circle>`.
 * @csspart label - The middle of the ring, around the slot.
 *
 * @cssproperty --el-progress-ring-size - The width and the height of the ring. Unset, it is
 *   `4rem`.
 * @cssproperty --el-progress-ring-track-width - The thickness of the ring. Unset, it is `0.25rem`.
 * @cssproperty --el-progress-ring-indicator-color - The part that is drawn. Unset, it is
 *   `--el-color-accent`, and the text colour without a theme.
 * @cssproperty --el-progress-ring-track-color - The whole ring. Unset, it is a fifth of the text
 *   colour.
 *
 * @property {number} value - How far the task is, from `0` to `max`. A value outside of that range
 *   is shown as the nearest one inside. Default `0`.
 * @property {number} max - The value of a task that is done. Default `100`.
 * @property {string} label - The accessible name of the ring. Default `'Progress'`.
 */
export default class ProgressRing extends TemplateElement {
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
            label: 'Progress',
        };
    }

    template() {
        const { value, max, percent } = progressOf(this.value, this.max);

        // The length of the indicator counts as 100 (pathLength), whatever size the ring has. One
        // dash as long as the ring is pushed back by the share that is not done yet.
        return html`
            <div
                part="base"
                class="progress-ring"
                role="progressbar"
                aria-label="${this.label}"
                aria-valuemin="0"
                aria-valuemax="${max}"
                aria-valuenow="${value}"
            >
                <svg class="ring" aria-hidden="true" focusable="false">
                    <circle part="track" class="track"></circle>
                    <circle
                        part="indicator"
                        class="indicator"
                        pathLength="100"
                        stroke-dasharray="100"
                        stroke-dashoffset="${100 - percent}"
                    ></circle>
                </svg>
                <span part="label" class="label"><slot></slot></span>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-progress-ring', ProgressRing);
}

import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import style from './avatar.style.js';

/**
 * An avatar: the picture that stands for a person or a thing. It shows the first of these that it
 * has: the image, the initials, an icon. An image that cannot be loaded makes way for the next.
 * With a `label` it is an image with that name for assistive technology; without one it is a
 * decoration beside a name that is written out.
 *
 * @element el-avatar
 *
 * @slot icon - The icon that is shown without an image and without initials. Unset, it is the
 *   outline of a person.
 *
 * @csspart base - The shape of the avatar: background, radius. It carries the role and the label.
 * @csspart image - The image.
 * @csspart initials - The initials.
 * @csspart icon - The region of the `icon` slot.
 *
 * @cssproperty --el-avatar-size - The width and the height of the avatar. Unset, the `size`
 *   decides.
 *
 * @property {string} image - The address of the image.
 * @property {string} label - The accessible name of the avatar, the name of the person for
 *   example. Without it the avatar is hidden from assistive technology.
 * @property {string} initials - One or two letters that are shown without an image.
 * @property {'circle'|'square'|'rounded'} shape - The shape of the avatar. Default `'circle'`.
 *   Reflected to the `shape` attribute.
 * @property {'small'|'medium'|'large'} size - The width and the height: the control height of that
 *   size, `--el-control-height` times 0.8, 1 or 1.25.
 *   Default `'medium'`. Reflected to the `size` attribute.
 */
export default class Avatar extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet and the size module select the host by these attributes.
            propertyOptions: {
                shape: { reflect: true },
                size: { reflect: true },
            },
        });
    }

    properties() {
        return {
            image: '',
            label: '',
            initials: '',
            shape: 'circle',
            size: 'medium',
        };
    }

    connected() {
        // An image of server-rendered markup can have failed before the element was there to hear
        // of it: the browser loads it while it parses.
        const image = this.$refs.image;
        if (image?.complete && image.naturalWidth === 0) this._giveUpOnImage();
    }

    events() {
        return {
            '[ref=image]': {
                error: () => this._giveUpOnImage(),
            },
        };
    }

    /**
     * Remembers the image that could not be loaded, so that the next thing the avatar has is
     * shown instead. Another address in `image` is tried again.
     * @private
     */
    _giveUpOnImage() {
        this._failedImage = this.image;
        this.requestUpdate();
    }

    /** @private */
    _contentTemplate() {
        if (this.image && this.image !== this._failedImage) {
            // The name is on the base, for the image, the initials and the icon alike.
            return html`<img part="image" ref="image" src="${this.image}" alt="" />`;
        }
        if (this.initials) return html`<span part="initials">${this.initials}</span>`;
        return html`
            <span part="icon">
                <slot name="icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="8.5" r="4.5"></circle>
                        <path d="M3 22a9 9 0 0 1 18 0z"></path>
                    </svg>
                </slot>
            </span>
        `;
    }

    template() {
        // Every name is in the map every time: the directive takes an attribute off again only when
        // it finds its name there, with no value.
        const naming = {
            role: this.label ? 'img' : undefined,
            'aria-label': this.label || undefined,
            'aria-hidden': this.label ? undefined : 'true',
        };

        return html`<span part="base" class="avatar" ${spreadAttributes(naming)}>${this._contentTemplate()}</span>`;
    }
}

export function define() {
    defineElement('el-avatar', Avatar);
}

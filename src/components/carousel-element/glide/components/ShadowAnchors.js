import GlideAnchorComponent from '@glidejs/glide/src/components/anchors';

export default function (Glide, Components, Events) {
    const glideAnchors = GlideAnchorComponent(Glide, Components, Events);

    glideAnchors.mount = function () {
        this._a = Components.Html.host.querySelectorAll('a');
        this.bind();
    };

    return glideAnchors;
}

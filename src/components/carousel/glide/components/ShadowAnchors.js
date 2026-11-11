import GlideAnchorComponent from '@glidejs/glide/src/components/anchors';

export default function (Glide, Components, Events) {
    const glideAnchors = GlideAnchorComponent(Glide, Components, Events);

    glideAnchors.mount = function () {
        // The links of the slides are in the light DOM, those of the clones in the shadow root.
        const { host, wrapper } = Components.Html;
        this._a = [...host.querySelectorAll('a'), ...wrapper.querySelectorAll('a')];
        this.bind();
    };

    return glideAnchors;
}

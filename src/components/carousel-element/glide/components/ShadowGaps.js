import GlideGapsComponent from '@glidejs/glide/src/components/gaps';
import { throttle } from '@glidejs/glide/src/utils/wait';

export default function (Glide, Components, Events) {
    const Gaps = GlideGapsComponent(Glide, Components, Events);

    /**
     * Apply calculated gaps:
     * - after building, so slides (including clones) will receive proper margins
     * - on updating via API, to recalculate gaps with new options
     */
    Events.on(
        ['build.after', 'update'],
        throttle(() => {
            Gaps.apply(Components.Html.host.children);
        }, 30),
    );

    /**
     * Remove gaps:
     * - on destroying to bring markup to its inital state
     */
    Events.on('destroy', () => {
        Gaps.remove(Components.Html.host.children);
    });

    return Gaps;
}

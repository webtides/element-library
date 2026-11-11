import GlideClonesComponent from '@glidejs/glide/src/components/clones';

/**
 * Glide's clones of the first and the last slides, which a carousel needs to loop.
 *
 * They live in the shadow root, before and after the slot of the slides, and not among the
 * children of the element. Those belong to the page: a framework that hydrates server-rendered
 * slides finds nodes it did not render otherwise.
 */
export default function (Glide, Components, Events) {
    const glideClones = GlideClonesComponent(Glide, Components, Events);

    glideClones.append = () => {
        const { wrapper } = Components.Html;
        const { items } = glideClones;

        const half = Math.floor(items.length / 2);
        const before = items.slice(0, half).reverse();
        const after = items.slice(half * -1).reverse();
        const width = `${Components.Sizes.slideWidth}px`;

        // The slot stays between them, so the slides of the page render in the middle.
        wrapper.prepend(...before);
        wrapper.append(...after);

        for (const clone of items) {
            clone.style.width = width;
        }
    };

    glideClones.remove = () => {
        for (const clone of glideClones.items) {
            clone.remove();
        }
    };

    return glideClones;
}

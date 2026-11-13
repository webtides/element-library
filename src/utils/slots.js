/**
 * Whether an element is slotted into a named slot of a component: `hasSlotted(this, 'header')`.
 * A component that leaves a region out while its slot is empty asks this in its template.
 *
 * The children of the host are asked, not the slot. A template is rendered on a server too, where
 * there are no slots to ask, and the markup rendered there has to leave the same regions out as
 * the browser does, or the page moves when the element takes over.
 *
 * element-js renders again when a child comes or goes. A child that changes its `slot` attribute
 * does neither: the component listens for `slotchange` and asks for an update.
 *
 * A `<slot>` of another component that is passed on (`<slot name="title" slot="header">`) counts,
 * also while nothing is slotted into it.
 * @param {Element} host - The component.
 * @param {string} name - The name of the slot.
 * @returns {boolean}
 */
export function hasSlotted(host, name) {
    return [...host.children].some((child) => child.getAttribute('slot') === name);
}

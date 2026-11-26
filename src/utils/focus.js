/**
 * Whether the focus has left a group of controls, asked when one of them loses it (`blur`).
 *
 * The focus is still in the group while it moves from one control to the next, with Tab or the
 * arrow keys: the event names the control that gets it. It is also on its way to another control
 * of the group while a pointer is pressed inside: the control that had the focus loses it when the
 * pointer goes down, and a click on a label gives it to the control of that label only when the
 * pointer goes up.
 *
 * A group takes itself as touched once the user has left it. Asked on every `blur`, it would show
 * "choose one" while the user is choosing.
 * @param {Element} group - The element around the controls.
 * @param {FocusEvent} event - The `blur` of one of the controls.
 * @returns {boolean}
 */
export function focusLeft(group, event) {
    return !(group.contains(event.relatedTarget) || group.matches(':active'));
}

/** What takes the focus by its tag or its attributes. Whether it does right now is asked of each one. */
const FOCUSABLE =
    'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';

/**
 * The element that has the focus, also when it is inside of a shadow root: `document.activeElement`
 * stops at the element whose shadow root the focus is in.
 * @returns {Element | null}
 */
export function activeElement() {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active;
}

/**
 * The elements inside of `root` that the user can move the focus to, in the order of the document:
 * the controls of the page, and the ones inside of the shadow roots of custom elements, the
 * `<button>` of an `el-button` for example. Left out are controls that are disabled, inert, not
 * shown or taken out of the tab order (`tabindex="-1"`).
 *
 * Each radio of a group is one of them, also the ones that are not checked: the Tab key stops at
 * a group once, the arrow keys of a toolbar at every radio.
 * @param {Element} root
 * @returns {HTMLElement[]}
 */
export function focusableElements(root) {
    const found = [];
    const visit = (parent) => {
        for (const element of parent.children) {
            if (element.matches(FOCUSABLE) && takesFocus(element)) found.push(element);
            // The controls of a component first, then what the page has put into it.
            if (element.shadowRoot) visit(element.shadowRoot);
            visit(element);
        }
    };
    visit(root);
    return found;
}

/**
 * Whether the user can move the focus to `root` or to an element inside of it, the ones in shadow
 * roots included. It stops at the first one it finds, which `focusableElements()` does not.
 * @param {Element} root
 * @returns {boolean}
 */
export function containsFocusable(root) {
    const visit = (parent) => {
        for (const element of parent.children) {
            if (element.matches(FOCUSABLE) && takesFocus(element)) return true;
            if (element.shadowRoot && visit(element.shadowRoot)) return true;
            if (visit(element)) return true;
        }
        return false;
    };
    return (root.matches(FOCUSABLE) && takesFocus(root)) || visit(root);
}

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function takesFocus(element) {
    if (element.matches(':disabled') || element.getAttribute('tabindex') === '-1') return false;
    if (element.closest('[inert]')) return false;
    // Not rendered, or hidden: by itself, or by something around it.
    return element.checkVisibility?.({ visibilityProperty: true }) ?? element.getClientRects().length > 0;
}

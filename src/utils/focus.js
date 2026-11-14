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

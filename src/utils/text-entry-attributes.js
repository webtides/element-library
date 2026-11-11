/**
 * The attributes a phone keyboard, a password manager and the browser's text assistance read from a
 * text control. A field that renders its own `<input>` or `<textarea>` takes them as properties and
 * passes them on to that control:
 *
 * - `properties()` lists each name with the default `null`, which means not set. They are written
 *   out there like every other property, so the API of a field can be read in one place.
 * - the constructor calls `shadowNativeTextEntryProperties(this)`
 * - the template writes `${spreadAttributes(textEntryAttributes(this))}` on the control
 */
const TEXT_ENTRY_ATTRIBUTES = [
    'autocomplete',
    'inputmode',
    'enterkeyhint',
    'autocapitalize',
    'autocorrect',
    'spellcheck',
];

/**
 * Some of the names already exist as properties on every HTMLElement and have a value there without
 * being set (`spellcheck` is `true`). element-js takes a value it finds on the element as the
 * initial value of a property, so an attribute that was never set would look set. An own, empty
 * property on the instance hides the native one until element-js defines the property.
 *
 * A property the instance already owns is left alone: it holds a value that was set before the
 * element was defined.
 * @param {HTMLElement} element
 */
export function shadowNativeTextEntryProperties(element) {
    for (const name of TEXT_ENTRY_ATTRIBUTES) {
        if (name in element && !Object.hasOwn(element, name)) {
            Object.defineProperty(element, name, {
                value: undefined,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        }
    }
}

/**
 * The attributes for the control, to be handed to `spreadAttributes()`, which leaves out the ones
 * that are `null`.
 * @param {HTMLElement} element
 * @returns {Record<string, unknown>}
 */
export function textEntryAttributes(element) {
    return Object.fromEntries(TEXT_ENTRY_ATTRIBUTES.map((name) => [name, element[name] ?? null]));
}

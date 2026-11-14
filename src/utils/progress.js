/** What `max` is without a value that can be used. */
const MAX = 100;

/**
 * The progress a component shows, from a `value` and a `max` that may hold anything:
 * `progressOf(this.value, this.max)`. The progress bar and the progress ring ask this in their
 * templates, so both read the two properties the same way.
 *
 * - `max` is a number above zero, or 100 where it is none.
 * - `value` is a number from 0 to `max`. A value outside of that range is the nearest one inside,
 *   a value that is no number is 0.
 * - `percent` is the share `value` is of `max`, from 0 to 100, in hundredths: a third of the way
 *   is 33.33, not 33.
 * @param {*} value
 * @param {*} max
 * @returns {{ value: number, max: number, percent: number }}
 */
export function progressOf(value, max) {
    const top = Number(max);
    const safeMax = Number.isFinite(top) && top > 0 ? top : MAX;
    const number = Number(value);
    const safeValue = Number.isFinite(number) ? Math.min(Math.max(number, 0), safeMax) : 0;

    return { value: safeValue, max: safeMax, percent: Math.round((safeValue / safeMax) * 10000) / 100 };
}

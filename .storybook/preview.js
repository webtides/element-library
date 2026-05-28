function isElementJsTemplate(value) {
    return (
        value &&
        typeof value === 'object' &&
        Array.isArray(value.strings) &&
        Array.isArray(value.values) &&
        typeof value.renderInto === 'function'
    );
}

// TODO: drop this walker once element-js exposes a clean SSR/toString variant
// that omits the <!--template-part--> / <!--dom-part-N--> markers. We reconstruct
// the original template source by hand because TemplateResult.toString() emits
// the SSR-flavored output, which is noisy in Storybook's "Show code" panel.
function templateToSource(result) {
    const { strings, values } = result;
    let source = '';
    for (let i = 0; i < strings.length; i++) {
        source += strings[i];
        if (i < values.length) {
            const value = values[i];
            if (isElementJsTemplate(value)) {
                source += templateToSource(value);
            } else if (Array.isArray(value)) {
                source += value.map((v) => (isElementJsTemplate(v) ? templateToSource(v) : String(v ?? ''))).join('');
            } else {
                source += String(value ?? '');
            }
        }
    }
    return source;
}

/** @type { import('@storybook/web-components').Preview } */
const preview = {
    parameters: {
        options: {
            storySort: {
                order: ['Docs', ['Introduction', 'Installation', 'Usage'], 'Components'],
            },
        },
        docs: {
            source: {
                transform: (code, context) => {
                    const result = context.originalStoryFn?.(context.args, context);
                    if (isElementJsTemplate(result)) {
                        return templateToSource(result).trim();
                    }
                    return code;
                },
            },
        },
    },
    decorators: [
        (story) => {
            const result = story();
            if (isElementJsTemplate(result)) {
                const container = document.createElement('div');
                result.renderInto(container);
                return container;
            }
            return result;
        },
    ],
};

export default preview;

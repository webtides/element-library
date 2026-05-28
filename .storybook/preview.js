import defaultThemeCSS from '../src/themes/default.css?raw';
import darkThemeCSS from '../src/themes/dark.css?raw';

const themeSheets = {
    default: (() => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(defaultThemeCSS);
        return sheet;
    })(),
    dark: (() => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(darkThemeCSS);
        return sheet;
    })(),
};

const allThemeSheets = Object.values(themeSheets);

function applyTheme(theme) {
    const adopted = document.adoptedStyleSheets.filter((s) => !allThemeSheets.includes(s));
    const sheet = themeSheets[theme];
    document.adoptedStyleSheets = sheet ? [...adopted, sheet] : adopted;
}

function applyColorScheme(scheme) {
    if (scheme === 'auto') {
        document.documentElement.style.removeProperty('color-scheme');
    } else {
        document.documentElement.style.setProperty('color-scheme', scheme);
    }
}

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
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Design-token theme applied at :root',
            defaultValue: 'default',
            toolbar: {
                icon: 'paintbrush',
                items: [
                    { value: 'none', title: 'None (headless)' },
                    { value: 'default', title: 'Default' },
                    { value: 'dark', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
        colorScheme: {
            name: 'Color scheme',
            description: 'CSS color-scheme override on <html>',
            defaultValue: 'auto',
            toolbar: {
                icon: 'mirror',
                items: [
                    { value: 'auto', title: 'System' },
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (story, context) => {
            applyTheme(context.globals.theme);
            applyColorScheme(context.globals.colorScheme);

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

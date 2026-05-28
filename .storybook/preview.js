const html = String.raw;

/** @type { import('@storybook/web-components').Preview } */
const preview = {
    parameters: {
        options: {
            storySort: {
                order: ['Docs', ['Introduction', 'Installation', 'Usage'], 'Components'],
            },
        },
    },
    decorators: [],
};

export default preview;

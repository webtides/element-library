/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-docs', '@chromatic-com/storybook', '@storybook/addon-a11y'],
    framework: {
        name: '@storybook/web-components-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },

    previewHead: (head) => `
        ${head}
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            [cloak] {
                display: none;
            }
        </style>
    `,
};
export default config;

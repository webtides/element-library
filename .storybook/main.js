/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
    // stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    stories: ['../src/components/input-field/input-field.stories.js'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@chromatic-com/storybook',
        '@storybook/addon-a11y',
        '@storybook/addon-interactions',
        // '@storybook/addon-coverage',
    ],
    framework: {
        name: '@storybook/web-components-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
};
export default config;

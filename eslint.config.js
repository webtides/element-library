import storybook from 'eslint-plugin-storybook';

export default [
    ...storybook.configs['flat/recommended'],
    {
        files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
        rules: {
            // These rules use context.getSourceCode() which was removed in ESLint 10.
            // Re-enable once eslint-plugin-storybook ships a fix or we bump Storybook to 9+.
            'storybook/prefer-pascal-case': 'off',
            'storybook/use-storybook-testing-library': 'off',
        },
    },
];

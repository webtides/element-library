import { defineConfig } from 'vite-plus';

export default defineConfig({
    lint: {
        plugins: ['oxc', 'typescript', 'unicorn'],
        categories: {
            correctness: 'warn',
        },
        env: {
            builtin: true,
        },
        overrides: [
            {
                files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
                rules: {
                    'storybook/await-interactions': 'error',
                    'storybook/context-in-play-function': 'error',
                    'storybook/default-exports': 'error',
                    'storybook/hierarchy-separator': 'warn',
                    'storybook/no-redundant-story-name': 'warn',
                    'storybook/no-renderer-packages': 'error',
                    'storybook/prefer-pascal-case': 'warn',
                    'storybook/story-exports': 'error',
                    'storybook/use-storybook-expect': 'error',
                    'storybook/use-storybook-testing-library': 'error',
                    'import/no-anonymous-default-export': 'off',
                    'react/rules-of-hooks': 'off',
                },
                jsPlugins: ['eslint-plugin-storybook'],
                plugins: ['react', 'import'],
            },
            {
                files: ['.storybook/main.@(js|cjs|mjs|ts)'],
                rules: {
                    'storybook/no-uninstalled-addons': 'error',
                },
                jsPlugins: ['eslint-plugin-storybook'],
            },
        ],
        // Type-aware rules need a strict, checked TypeScript program. tsconfig.json only emits
        // declarations from JSDoc here (`checkJs: false`, `strict: false`), so they would just add noise.
        options: {
            typeAware: false,
            typeCheck: false,
        },
        jsPlugins: [
            {
                name: 'vite-plus',
                specifier: 'vite-plus/oxlint-plugin',
            },
        ],
        rules: {
            'vite-plus/prefer-vite-plus-imports': 'error',
        },
    },
    fmt: {
        endOfLine: 'lf',
        printWidth: 120,
        trailingComma: 'all',
        tabWidth: 4,
        semi: true,
        singleQuote: true,
        arrowParens: 'always',
        sortPackageJson: false,
        overrides: [
            {
                files: ['*.md'],
                options: {
                    useTabs: false,
                    trailingComma: 'none',
                    proseWrap: 'never',
                },
            },
            {
                files: ['*.css', '*.yaml', '*.yml'],
                options: {
                    tabWidth: 2,
                },
            },
            {
                files: ['*.json'],
                options: {
                    tabWidth: 2,
                },
            },
        ],
        ignorePatterns: [
            'node_modules/',
            'storybook-static/',
            'types/',
            'package-lock.json',
            'custom-elements.json',
            'web-types.json',
        ],
    },
});

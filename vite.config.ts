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

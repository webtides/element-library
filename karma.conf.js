const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = config => {
    config.set(
        merge(createDefaultConfig(config), {
            files: [
                // runs all files ending with .test in the test folder,
                // can be overwritten by passing a --grep flag. examples:
                //
                // npm run test -- --grep test/foo/bar.test.js
                // npm run test -- --grep test/bar/*
                { pattern: config.grep ? config.grep : 'packages/**/**/tests/*.test.js', type: 'module' },
            ],

            plugins: [
                // load plugin
                require.resolve('@open-wc/karma-esm'),

                // fallback: resolve any karma- plugins
                'karma-*',
            ],

            frameworks: ['esm'],

            // see the karma-esm docs for all options
            esm: {
                // if you are using 'bare module imports' you will need this option
                nodeResolve: true,
                babel: true,
                babelConfig: {
                    babelrc: false,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                modules: false,
                                targets: {
                                    browsers: [
                                        'Chrome >= 76',
                                        'Safari >= 12',
                                        'iOS >= 12',
                                        'Firefox >= 68',
                                        'Edge >= 17',
                                    ],
                                },
                            },
                        ],
                    ],
                    plugins: [
                        ['@babel/plugin-proposal-class-properties', { loose: true }],
                        '@babel/plugin-proposal-nullish-coalescing-operator',
                        '@babel/plugin-proposal-optional-chaining',
                        [
                            'transform-postcss',
                            {
                                config: './.storybook/postcss.config.js',
                            },
                        ],
                    ],
                },
            },

            coverageIstanbulReporter: {
                dir: 'test/coverage',
            },
        }),
    );
    return config;
};

const postcss = require('rollup-plugin-postcss');

const defaultPostCSSPlugins = options => [
    require('postcss-import')(options.postCssImport || {}),
    require('postcss-nested')(),
    require('autoprefixer')({
        grid: false,
    }),
];

const defaultPostCssOptions = {
    plugins: defaultPostCSSPlugins({}),
    inject: false,
    minimize: false,
    sourceMap: false,
};

module.exports = {
    stories: [
        '../packages/**/**/stories/*.stories.js',
    ],
    addons: [
        'storybook-prebuilt/addon-actions/register.js',
        'storybook-prebuilt/addon-knobs/register.js',
        'storybook-prebuilt/addon-a11y/register.js',
        'storybook-prebuilt/addon-docs/register.js',
    ],
    esDevServer: {
        compatibility: 'none',
        nodeResolve: true,
        watch: true,
        open: false,
        babel: true,
        babelConfig: {
            babelrc: false,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        targets: {
                            browsers: ['Chrome >= 76', 'Safari >= 12', 'iOS >= 12', 'Firefox >= 68', 'Edge >= 79'],
                        },
                    },
                ],
            ],
            plugins: [
				['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
				['@babel/plugin-proposal-optional-chaining', { loose: true }],
				['@babel/plugin-proposal-class-properties', { loose: true }],
				'@babel/plugin-proposal-export-default-from',
                [
                    'transform-postcss',
                    {
                        config: './.storybook/postcss.config.js',
                    },
                ],
				['module-resolver', { root: ['./'] }],
            ],
        },
    },
    rollup: config => {
        // add PostCSS plugin for importing .css files
        config.plugins.push(
            postcss({
                ...defaultPostCssOptions,
            }),
        );
    },
};

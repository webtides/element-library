const postcss = require('postcss');
const rollupPostcss = require('rollup-plugin-postcss');

module.exports = {
    stories: ['../packages/**/**/stories/*.stories.js'],
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
        plugins: [
            // create an inline plugin
            {
                resolveMimeType(context) {
                    // change all CSS files to JS
                    if (context.response.is('css')) {
                        return 'js';
                    }
                },
                async transform(context) {
                    if (context.response.is('css') || context.path.includes('.css')) {
                        let css = context.body;
                        const plugins = require('./postcss.config')().plugins;
                        await postcss(plugins)
                            .process(css, {})
                            .then((result) => {
                                css = result.css;
                            });
                        return { body: `export default \`${css}\`;` };
                    }
                },
            },
        ],
    },

    // Rollup build output directory (build-storybook only)
    // outputDir: '../docs',
    // Configuration for rollup (build-storybook only)
    rollup: (config) => {
        config.plugins = [
            rollupPostcss({
                plugins: [
                    require('postcss-import')(),
                    require('postcss-nested')(),
                    require('autoprefixer')({
                        grid: true,
                    }),
                ],
            }),
            ...config.plugins,
        ];

        console.log({ config: config.plugins });

        return config;
    },
};

module.exports = (ctx) => ({
    plugins: [
        require('postcss-import')(),
        require('postcss-nested')(),
        require('autoprefixer')({
            grid: false,
        }),
    ],
    inject: false,
    minimize: false,
    sourceMap: true,
});

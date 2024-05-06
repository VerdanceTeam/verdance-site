const sass = require('sass');
const path = require('node:path');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('src/assets/');
    eleventyConfig.addTemplateFormats('scss');

    // Creates the extension for use
    eleventyConfig.addExtension('scss', {
        outputFileExtension: 'css', // optional, default: "html"

        // `compile` is called once per .scss file in the input directory
        compile: function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);

            let result = sass.compileString(inputContent, {
                loadPaths: [parsed.dir || '.', this.config.dir.includes],
            });

            return (data) => {
                return result.css;
            };
        },
    });

    return {
        markdownTemplateEngine: 'liquid',
        dir: {
            input: 'src',
            output: 'public',
            layouts: '_layouts',
            includes: '_includes',
            data: '_data',
        },
    };
};

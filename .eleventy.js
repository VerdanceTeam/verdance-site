const sass = require('sass');
const path = require('node:path');
const Image = require('@11ty/eleventy-img');

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

    eleventyConfig.addLiquidShortcode('svgIcon', async (src) => {
        const fullPath = path.join(__dirname, 'src/assets/', src);
        try {
            let metadata = await Image(fullPath, {
                formats: ['svg'],
                dryRun: true,
            });

            if (
                metadata &&
                metadata.svg &&
                metadata.svg[0] &&
                metadata.svg[0].buffer
            ) {
                return metadata.svg[0].buffer.toString();
            } else {
                console.error(`Invalid SVG metadata for ${src}`);
                return `<svg><!-- SVG metadata not available --></svg>`;
            }
        } catch (err) {
            console.error(`Error reading SVG file: ${fullPath}`, err);
            return `<svg><!-- Error reading SVG file --></svg>`;
        }
    });

    // Remove the .html extension from pages
    eleventyConfig.addTransform('clean-urls', function (content, outputPath) {
        if (outputPath && outputPath.endsWith('.html')) {
            return content.replace(/\.html$/, '');
        }
        return content;
    });

    // Add a transform to remove HTML comments
    eleventyConfig.addTransform(
        'remove-comments',
        function (content, outputPath) {
            if (outputPath && outputPath.endsWith('.html')) {
                // Remove HTML comments
                return content.replace(/<!--[\s\S]*?-->/g, '');
            }
            return content;
        }
    );

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

// .eleventy.js
// 1) Load env vars early. Prefer .env.local (gitignored) for local dev;
//    fall back to .env if present; in CI use provider-set env vars.
try {
    require('dotenv').config({ path: '.env.local' });
} catch {}
require('dotenv').config();

const sass = require('sass');
const path = require('node:path');
const Image = require('@11ty/eleventy-img');
// ✨ Add Contentful rich text renderer
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('src/assets/');
    eleventyConfig.addTemplateFormats('scss');

    // Optional: sanity check (won't fail build—just warns)
    if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_CDA_TOKEN) {
        console.warn(
            '[11ty] Contentful env vars missing; _data/posts.js may return [].'
        );
    }

    // SCSS -> CSS
    eleventyConfig.addExtension('scss', {
        outputFileExtension: 'css',
        compile: function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            let result = sass.compileString(inputContent, {
                loadPaths: [parsed.dir || '.', this.config.dir.includes],
            });
            return () => result.css;
        },
    });

    // SVG inline shortcode (kept as-is)
    eleventyConfig.addLiquidShortcode('svgIcon', async (src) => {
        const fullPath = path.join(__dirname, 'src/assets/', src);
        try {
            let metadata = await Image(fullPath, {
                formats: ['svg'],
                dryRun: true,
            });
            if (metadata?.svg?.[0]?.buffer) {
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

    // ✨ Contentful Rich Text -> HTML shortcode
    eleventyConfig.addLiquidShortcode('renderRichText', (rt) => {
        if (!rt || !rt.json) return '';
        try {
            return documentToHtmlString(rt.json);
        } catch (e) {
            console.error('[RichText] render error', e);
            return '';
        }
    });

    // Remove the .html extension from pages
    eleventyConfig.addTransform('clean-urls', function (content, outputPath) {
        if (outputPath && outputPath.endsWith('.html')) {
            return content.replace(/\.html$/, '');
        }
        return content;
    });

    // Remove HTML comments
    eleventyConfig.addTransform(
        'remove-comments',
        function (content, outputPath) {
            if (outputPath && outputPath.endsWith('.html')) {
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

// .eleventy.js
// -----------------------------------------------------------
// Eleventy configuration file for Verdance site
// -----------------------------------------------------------
//
// Responsibilities:
// - Load environment variables (Contentful tokens, etc.)
// - Add support for SCSS → CSS compilation
// - Add shortcodes for inlining SVGs
// - Add shortcodes/filters to render Contentful Rich Text JSON
// - Add transforms to clean up HTML output (remove .html ext, strip comments)
// - Define input/output/layout/data directories
//

// 1) Load env vars early. Prefer .env.local (gitignored) for local dev;
//    fall back to .env if present; in CI use provider-set env vars.
try {
    require('dotenv').config({ path: '.env.local' });
} catch {}
require('dotenv').config();

// 2) Dependencies
const sass = require('sass');
const path = require('node:path');
const Image = require('@11ty/eleventy-img');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');

// 3) Exported Eleventy config
module.exports = function (eleventyConfig) {
    // -----------------------------------------------------------
    // Copy static assets (images, fonts, etc.)
    // -----------------------------------------------------------
    eleventyConfig.addPassthroughCopy('src/assets/');

    // -----------------------------------------------------------
    // Add SCSS as a recognized template format and compile to CSS
    // -----------------------------------------------------------
    eleventyConfig.addTemplateFormats('scss');
    eleventyConfig.addExtension('scss', {
        outputFileExtension: 'css',
        // compile() runs once per .scss file
        compile: function (inputContent, inputPath) {
            let parsed = path.parse(inputPath);
            let result = sass.compileString(inputContent, {
                loadPaths: [parsed.dir || '.', this.config.dir.includes],
            });
            return () => result.css;
        },
    });

    // Warn if Contentful env vars are missing
    if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_CDA_TOKEN) {
        console.warn(
            '[11ty] Contentful env vars missing; _data/posts.js may return [].'
        );
    }

    // -----------------------------------------------------------
    // Shortcode: Inline an SVG from /src/assets
    // Usage: {% svgIcon 'icons/thing.svg' %}
    // -----------------------------------------------------------
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

    // -----------------------------------------------------------
    // Shortcode: Render full Contentful Rich Text JSON → HTML
    // Usage: {% renderRichText post.content %}
    // -----------------------------------------------------------
    eleventyConfig.addLiquidShortcode('renderRichText', (rt) => {
        if (!rt || !rt.json) return '';
        try {
            return documentToHtmlString(rt.json);
        } catch (e) {
            console.error('[RichText] render error', e);
            return '';
        }
    });

    // -----------------------------------------------------------
    // Helpers for slicing Contentful Rich Text into pieces
    // Used to render specific paragraphs or split content
    // -----------------------------------------------------------
    function docWith(nodes) {
        return { nodeType: 'document', data: {}, content: nodes };
    }

    function splitRichTextByParagraphs(
        rt,
        { takeFirstN = 0, takeOnlyIndex = null, dropFirstN = 0 } = {}
    ) {
        const src = rt?.json?.content || [];
        let paraSeen = 0;
        const out = [];

        for (const node of src) {
            const isPara = node?.nodeType === 'paragraph';

            if (takeOnlyIndex !== null) {
                if (isPara) {
                    if (paraSeen === takeOnlyIndex) out.push(node);
                    paraSeen++;
                }
                continue;
            }

            if (takeFirstN > 0) {
                if (isPara) {
                    if (paraSeen < takeFirstN) out.push(node);
                    paraSeen++;
                }
                continue;
            }

            if (dropFirstN > 0) {
                if (isPara) {
                    if (paraSeen >= dropFirstN) out.push(node);
                    paraSeen++;
                } else {
                    if (paraSeen >= dropFirstN) out.push(node);
                }
                continue;
            }
        }
        return docWith(out);
    }

    // -----------------------------------------------------------
    // Shortcode: Render a single paragraph (by index, 0-based)
    // Usage: {% renderParagraph post.content 1 %}
    // -----------------------------------------------------------
    eleventyConfig.addLiquidShortcode('renderParagraph', (rt, indexStr) => {
        const index = parseInt(indexStr, 10);
        if (!rt || Number.isNaN(index)) return '';
        try {
            return documentToHtmlString(
                splitRichTextByParagraphs(rt, { takeOnlyIndex: index })
            );
        } catch (e) {
            console.error('[RichText renderParagraph] error', e);
            return '';
        }
    });

    // -----------------------------------------------------------
    // Shortcode: Render the first N paragraphs
    // Usage: {% renderFirstNParagraphs post.content 2 %}
    // -----------------------------------------------------------
    eleventyConfig.addLiquidShortcode('renderFirstNParagraphs', (rt, nStr) => {
        const n = parseInt(nStr, 10);
        if (!rt || Number.isNaN(n) || n <= 0) return '';
        try {
            return documentToHtmlString(
                splitRichTextByParagraphs(rt, { takeFirstN: n })
            );
        } catch (e) {
            console.error('[RichText renderFirstNParagraphs] error', e);
            return '';
        }
    });

    // -----------------------------------------------------------
    // Shortcode: Render everything after the first N paragraphs
    // Usage: {% renderAfterNParagraphs post.content 2 %}
    // -----------------------------------------------------------
    eleventyConfig.addLiquidShortcode('renderAfterNParagraphs', (rt, nStr) => {
        const n = parseInt(nStr, 10);
        if (!rt || Number.isNaN(n) || n < 0) return '';
        try {
            return documentToHtmlString(
                splitRichTextByParagraphs(rt, { dropFirstN: n })
            );
        } catch (e) {
            console.error('[RichText renderAfterNParagraphs] error', e);
            return '';
        }
    });

    // -----------------------------------------------------------
    // Shortcode: Check if Nth paragraph exists (returns 'true'/'')
    // Usage: {% if hasParagraph post.content 1 %}...{% endif %}
    // -----------------------------------------------------------
    eleventyConfig.addLiquidShortcode('hasParagraph', (rt, indexStr) => {
        const index = parseInt(indexStr, 10);
        const blocks = rt?.json?.content || [];
        let count = 0;
        for (const node of blocks) {
            if (node.nodeType === 'paragraph') {
                if (count === index) return 'true';
                count++;
            }
        }
        return '';
    });

    // -----------------------------------------------------------
    // Transform: Remove trailing ".html" from URLs
    // -----------------------------------------------------------
    eleventyConfig.addTransform('clean-urls', function (content, outputPath) {
        if (outputPath && outputPath.endsWith('.html')) {
            return content.replace(/\.html$/, '');
        }
        return content;
    });

    // -----------------------------------------------------------
    // Transform: Strip HTML comments from output
    // -----------------------------------------------------------
    eleventyConfig.addTransform(
        'remove-comments',
        function (content, outputPath) {
            if (outputPath && outputPath.endsWith('.html')) {
                return content.replace(/<!--[\s\S]*?-->/g, '');
            }
            return content;
        }
    );

    // -----------------------------------------------------------
    // Directory structure & engines
    // -----------------------------------------------------------
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

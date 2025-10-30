// .eleventy.js
// -----------------------------------------------------------
// Eleventy configuration file for Verdance site
// -----------------------------------------------------------

try {
    require('dotenv').config({ path: '.env.local' });
} catch {}
require('dotenv').config();

const sass = require('sass');
const path = require('node:path');
const Image = require('@11ty/eleventy-img');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const { BLOCKS, INLINES } = require('@contentful/rich-text-types');

module.exports = function (eleventyConfig) {
    // Copy static assets (images, fonts, etc.)
    eleventyConfig.addPassthroughCopy('src/assets/');

    // SCSS -> CSS
    eleventyConfig.addTemplateFormats('scss');
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

    if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_CDA_TOKEN) {
        console.warn(
            '[11ty] Contentful env vars missing; _data/posts.js may return [].'
        );
    }

    // Inline SVG from /src/assets
    eleventyConfig.addLiquidShortcode('svgIcon', async (src) => {
        const fullPath = path.join(__dirname, 'src/assets/', src);
        try {
            let metadata = await Image(fullPath, {
                formats: ['svg'],
                dryRun: true,
            });
            if (metadata?.svg?.[0]?.buffer)
                return metadata.svg[0].buffer.toString();
            console.error(`Invalid SVG metadata for ${src}`);
            return `<svg><!-- SVG metadata not available --></svg>`;
        } catch (err) {
            console.error(`Error reading SVG file: ${fullPath}`, err);
            return `<svg><!-- Error reading SVG file --></svg>`;
        }
    });

    // ---------------- Rich Text rendering helpers ----------------
    const esc = (s = '') =>
        String(s).replace(
            /[&<>"']/g,
            (c) =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                }[c])
        );

    // Build a renderer that knows how to output assets using rt.links
    function renderDocWithAssets(rt, doc) {
        const blocks = rt?.links?.assets?.block || [];
        const hyperlinks = rt?.links?.assets?.hyperlink || [];
        const assetById = Object.fromEntries(
            [...blocks, ...hyperlinks].map((a) => [a.sys.id, a])
        );

        const options = {
            renderNode: {
                [BLOCKS.EMBEDDED_ASSET]: (node) => {
                    const id = node?.data?.target?.sys?.id;
                    const a = id && assetById[id];
                    if (!a) return '';
                    const alt = a.description || a.title || '';
                    return `<figure class="rt-asset"><img src="${
                        a.url
                    }" alt="${esc(
                        alt
                    )}" loading="lazy" decoding="async"></figure>`;
                },
                [INLINES.ASSET_HYPERLINK]: (node, next) => {
                    const id = node?.data?.target?.sys?.id;
                    const a = id && assetById[id];
                    const text = next(node.content);
                    return a
                        ? `<a href="${a.url}" target="_blank" rel="noopener noreferrer">${text}</a>`
                        : `<span>${text}</span>`;
                },
            },
        };

        return documentToHtmlString(doc, options);
    }

    // Usage: {% renderRichText post.content %}
    eleventyConfig.addLiquidShortcode('renderRichText', (rt) => {
        if (!rt || !rt.json) return '';
        return renderDocWithAssets(rt, rt.json);
    });

    // ---- Helpers to slice Rich Text by paragraphs (preserve non-paragraph nodes) ----
    function docWith(nodes) {
        return { nodeType: 'document', data: {}, content: nodes };
    }

    /**
     * Split by paragraph count while KEEPING non-paragraph nodes that occur
     * in the selected region.
     * - takeFirstN: include all nodes from the start up through the Nth paragraph.
     * - dropFirstN: drop everything up to and including the Nth paragraph; include everything after.
     */
    function splitRichTextByParagraphs(
        rt,
        { takeFirstN = null, dropFirstN = null } = {}
    ) {
        const src = rt?.json?.content || [];
        const out = [];
        let paraSeen = 0;

        if (takeFirstN !== null) {
            for (const node of src) {
                const isPara = node?.nodeType === 'paragraph';
                if (paraSeen < takeFirstN) out.push(node); // include any node before Nth paragraph
                if (isPara) paraSeen++;
                if (paraSeen >= takeFirstN) break; // stop after capturing through Nth paragraph
            }
            return docWith(out);
        }

        if (dropFirstN !== null) {
            for (const node of src) {
                const isPara = node?.nodeType === 'paragraph';
                if (isPara) {
                    paraSeen++; // count the paragraph first
                    if (paraSeen > dropFirstN) out.push(node);
                } else {
                    if (paraSeen >= dropFirstN) out.push(node); // include non-paras only after cutoff
                }
            }
            return docWith(out);
        }

        return docWith(src);
    }

    // Render a single paragraph (paragraph-only), keeps previous behavior.
    eleventyConfig.addLiquidShortcode('renderParagraph', (rt, indexStr) => {
        const index = parseInt(indexStr, 10);
        if (!rt || Number.isNaN(index)) return '';
        try {
            const blocks = rt?.json?.content || [];
            let paraSeen = 0;
            const pick = [];
            for (const node of blocks) {
                const isPara = node?.nodeType === 'paragraph';
                if (isPara && paraSeen === index) {
                    pick.push(node);
                    break;
                }
                if (isPara) paraSeen++;
            }
            return renderDocWithAssets(rt, docWith(pick));
        } catch (e) {
            console.error('[RichText renderParagraph] error', e);
            return '';
        }
    });

    // Render the first N paragraphs (preserves non-paragraph nodes before Nth)
    eleventyConfig.addLiquidShortcode('renderFirstNParagraphs', (rt, nStr) => {
        const n = parseInt(nStr, 10);
        if (!rt || Number.isNaN(n) || n <= 0) return '';
        try {
            const sliced = splitRichTextByParagraphs(rt, { takeFirstN: n });
            return renderDocWithAssets(rt, sliced);
        } catch (e) {
            console.error('[RichText renderFirstNParagraphs] error', e);
            return '';
        }
    });

    // Render everything after the first N paragraphs (preserves non-paragraph nodes after Nth)
    eleventyConfig.addLiquidShortcode('renderAfterNParagraphs', (rt, nStr) => {
        const n = parseInt(nStr, 10);
        if (!rt || Number.isNaN(n) || n < 0) return '';
        try {
            const sliced = splitRichTextByParagraphs(rt, { dropFirstN: n });
            return renderDocWithAssets(rt, sliced);
        } catch (e) {
            console.error('[RichText renderAfterNParagraphs] error', e);
            return '';
        }
    });

    // Check if Nth paragraph exists (returns 'true' or '')
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

    // Transforms
    eleventyConfig.addTransform('clean-urls', function (content, outputPath) {
        if (outputPath && outputPath.endsWith('.html'))
            return content.replace(/\.html$/, '');
        return content;
    });

    eleventyConfig.addTransform(
        'remove-comments',
        function (content, outputPath) {
            if (outputPath && outputPath.endsWith('.html'))
                return content.replace(/<!--[\s\S]*?-->/g, '');
            return content;
        }
    );

    // Directories & engines
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

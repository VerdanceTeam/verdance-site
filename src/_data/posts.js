// src/_data/posts.js
const EleventyFetch = require('@11ty/eleventy-fetch');

module.exports = async function () {
    try {
        const SPACE = process.env.CONTENTFUL_SPACE_ID;
        const ENV = process.env.CONTENTFUL_ENVIRONMENT || 'master';
        const TOKEN = process.env.CONTENTFUL_CDA_TOKEN;

        const url = `https://graphql.contentful.com/content/v1/spaces/${SPACE}/environments/${ENV}`;

        const response = await EleventyFetch(url, {
            duration: '1d', // cache on disk for 1 day
            type: 'json',
            fetchOptions: {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
            query {
              blogPostCollection(order: [sys_publishedAt_DESC]) {
                items {
                  sys { id publishedAt }
                  title
                  content { json }
                  pullquote
                  pullquoteImage
                }
              }
            }
          `,
                }),
            },
        });

        const items = response?.data?.blogPostCollection?.items || [];

        // grab the first non-empty paragraph from Contentful Rich Text
        function firstParagraphFromRichText(rt) {
            const blocks = rt?.json?.content || [];
            for (const node of blocks) {
                if (
                    node.nodeType === 'paragraph' &&
                    Array.isArray(node.content)
                ) {
                    const text = node.content
                        .filter(
                            (c) =>
                                c.nodeType === 'text' &&
                                typeof c.value === 'string'
                        )
                        .map((c) => c.value)
                        .join('')
                        .trim();
                    if (text) return text;
                }
            }
            return '';
        }

        return items.map((p) => ({
            ...p, // keep existing fields (title, pullquote, content, etc.)
            firstParagraph: firstParagraphFromRichText(p.content),
        }));
    } catch (e) {
        console.error('[Contentful] fetch failed', e);
        return [];
    }
};

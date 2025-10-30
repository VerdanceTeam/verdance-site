// src/_data/posts.js
const EleventyFetch = require('@11ty/eleventy-fetch');

const LIMIT = 10; // keep total query cost < 11k

const QUERY_WITH_ASSETS = `
  query ($limit: Int!) {
    blogPostCollection(order: [sys_publishedAt_DESC], limit: $limit) {
      items {
        sys { id publishedAt }
        title
        pullquote
        pullquoteImage
        blogAuthor
        blogAuthorLink
        content {
          json
          links {
            assets {
              block {
                sys { id }
                url
                title
                description
              }
            }
          }
        }
      }
    }
  }
`;

function firstParagraphFromRichText(rt) {
    const blocks = rt?.json?.content || [];
    for (const node of blocks) {
        if (node?.nodeType === 'paragraph' && Array.isArray(node.content)) {
            const text = node.content
                .filter(
                    (c) => c.nodeType === 'text' && typeof c.value === 'string'
                )
                .map((c) => c.value)
                .join('')
                .trim();
            if (text) return text;
        }
    }
    return '';
}

module.exports = async function () {
    const SPACE = process.env.CONTENTFUL_SPACE_ID;
    const ENV = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    const TOKEN = process.env.CONTENTFUL_CDA_TOKEN;

    if (!SPACE || !TOKEN) {
        console.error('[Contentful] Missing SPACE or TOKEN env vars.');
        return [];
    }

    const url = `https://graphql.contentful.com/content/v1/spaces/${SPACE}/environments/${ENV}`;

    const response = await EleventyFetch(url, {
        duration: '0s',
        type: 'json',
        fetchOptions: {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: QUERY_WITH_ASSETS,
                variables: { limit: LIMIT },
            }),
        },
    });

    if (response?.errors) {
        console.error(
            '[Contentful GraphQL] errors:',
            JSON.stringify(response.errors, null, 2)
        );
        // Hard fail so we notice if we ever hit the complexity ceiling again
        throw new Error('Contentful query failed — see errors above.');
    }

    const items = response?.data?.blogPostCollection?.items || [];
    return items.map((p) => ({
        ...p,
        firstParagraph: firstParagraphFromRichText(p.content),
    }));
};

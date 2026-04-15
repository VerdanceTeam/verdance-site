// src/_data/posts.js
const EleventyFetch = require('@11ty/eleventy-fetch');
const { LOCAL_DUMMY_POSTS } = require('./localDummyPosts');

const LIMIT = 10; // keep total query cost < 11k
const LOCALHOSTS = new Set(['localhost', '127.0.0.1', '::1']);

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
        tldr
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

function isLocalhostRuntime() {
    console.log('checking if localhost runtime');;
    const runMode = process.env.ELEVENTY_RUN_MODE;
    if (runMode === 'serve') return true;

    const args = process.argv || [];
    if (args.includes('--serve')) return true;

    const candidateUrls = [
        process.env.URL,
        process.env.SITE_URL,
        process.env.ELEVENTY_SERVER_URL,
    ].filter(Boolean);

    for (const candidate of candidateUrls) {
        try {
            const host = new URL(candidate).hostname;
            if (LOCALHOSTS.has(host)) return true;
        } catch (error) {
            // Ignore invalid URL values and continue checking.
        }
    }

    return false;
}

module.exports = async function () {
    const SPACE = process.env.CONTENTFUL_SPACE_ID;
    const ENV = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    const TOKEN = process.env.CONTENTFUL_CDA_TOKEN;

    if (isLocalhostRuntime()) {
        return LOCAL_DUMMY_POSTS.map((p) => ({
            ...p,
            firstParagraph: firstParagraphFromRichText(p.content),
        }));
    }

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

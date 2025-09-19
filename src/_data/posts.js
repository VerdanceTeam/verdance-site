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

        // return just the posts array (like jobs.js does with response.jobs)
        return response.data.blogPostCollection.items;
    } catch (e) {
        console.error('[Contentful] fetch failed', e);
        return [];
    }
};

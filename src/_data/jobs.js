const EleventyFetch = require('@11ty/eleventy-fetch');

module.exports = async function () {
    try {
        let url = 'https://api.ashbyhq.com/posting-api/job-board/verdance';

        let response = await EleventyFetch(url, {
            duration: '1d',
            type: 'json',
        });

        return response.jobs;
    } catch (e) {
        return [];
    }
};

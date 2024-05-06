const EleventyFetch = require('@11ty/eleventy-fetch');

// This just sample data to mimic an API response until we add in our Lever jobs
module.exports = async function () {
    try {
        let url =
            'https://gist.githubusercontent.com/etanb/de4963c9de226aa16bd713571dfec6a0/raw/60037a853b5e76054ff17689e7cb2522014b72df/sample_jobs.json';

        return EleventyFetch(url, {
            duration: '1d',
            type: 'json',
        });
    } catch (e) {
        return {
            // my failure fallback data
        };
    }
};

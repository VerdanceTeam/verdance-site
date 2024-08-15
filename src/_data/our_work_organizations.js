const EleventyFetch = require("@11ty/eleventy-fetch");

// This just sample data to mimic an API response until we add in our Lever jobs
module.exports = async function () {
  let ourWorkOrganizations = [];
  ourWorkOrganizations.push({
    "caption": "This caption describes the image below",
    "description": "The Data at the Point of Care API, currently in pilot mode, lets Medicare beneficiaries ensure their providers have access to their medical information from different doctors, so their medical team can deliver a higher standard of care. We’re helping make the changes to roll out this API to far larger groups, ensuring it’s secure, resilient, and accurate.",
    "logo": "https://image.similarpng.com/very-thumbnail/2020/07/Frowning-Face-emoji-on-transparent-PNG.png",
    "name": "Centers for Medicare & Medicaid Services",
    "screenshot": "https://image.similarpng.com/very-thumbnail/2020/07/Frowning-Face-emoji-on-transparent-PNG.png",
    "subheading": "In 2023, health care data still isn’t where it needs to be to be most useful.",
    "type_of_work": "API work - data migration",
  })
  return ourWorkOrganizations;
};

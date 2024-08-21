const EleventyFetch = require("@11ty/eleventy-fetch");

// This just sample data to mimic an API response until we add in our Lever jobs
module.exports = async function () {
  let ourWorkOrganizations = [];
  ourWorkOrganizations.push({
    "caption": "This caption describes the image above",
    "description": "It’s complex to both apply for these benefits and for VA to make accurate eligibility decisions. The PACT Act was a historic expansion of these benefits, and required VA to make sweeping changes to handle the increased volume and new requirements. We’ve been engaged in several efforts to improve Veterans’ benefits technology, including redesigning the disability benefits application form and using data science models to help VA process claims more efficiently.",
    "logo": "/assets/img/partners/VA-seal.png",
    "name": "Veterans Affairs",
    "screenshot": "/assets/img/screenshots/va-gov-screenshot.png",
    "subheading": "More than 5 million Veterans receive disability benefits from VA for conditions connected to their service.",
    "type_of_work": "API work - data migration",
  });
  ourWorkOrganizations.push({
    "caption": "This caption describes the image above",
    "description": "The Data at the Point of Care API, currently in pilot mode, lets Medicare beneficiaries ensure their providers have access to their medical information from different doctors, so their medical team can deliver a higher standard of care. We’re helping make the changes to roll out this API to far larger groups, ensuring it’s secure, resilient, and accurate.",
    "logo": "/assets/img/partners/CMS-logo.png",
    "name": "Centers for Medicare & Medicaid Services",
    "screenshot": "https://image.similarpng.com/very-thumbnail/2020/07/Frowning-Face-emoji-on-transparent-PNG.png",
    "subheading": "In 2023, health care data still isn’t where it needs to be to be most useful.",
    "type_of_work": "API work - data migration",
  });
  ourWorkOrganizations.push({
    "caption": "This caption describes the image above",
    "description": "We’re helping CDC build a platform called ReportStream to ensure we have better quality disease data when we need it, to support any condition that becomes necessary. The platform is rolled out in 35+ states and counting.",
    "logo": "https://image.similarpng.com/very-thumbnail/2020/07/Frowning-Face-emoji-on-transparent-PNG.png",
    "name": "Centers for Disease Control",
    "screenshot": "https://image.similarpng.com/very-thumbnail/2020/07/Frowning-Face-emoji-on-transparent-PNG.png",
    "subheading": "The COVID years exposed a lack of national technology infrastructure to seamlessly and accurately report disease information.",
    "type_of_work": "API work - data migration",
  });
  return ourWorkOrganizations;
};

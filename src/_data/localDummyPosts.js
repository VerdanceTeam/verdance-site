function textNode(value) {
    return {
        nodeType: 'text',
        value,
        marks: [],
        data: {},
    };
}

function paragraphNode(value) {
    return {
        nodeType: 'paragraph',
        data: {},
        content: [textNode(value)],
    };
}

function heading1Node(value) {
    return {
        nodeType: 'heading-1',
        data: {},
        content: [textNode(value)],
    };
}

function embeddedAssetNode(id) {
    return {
        nodeType: 'embedded-asset-block',
        data: { target: { sys: { id } } },
        content: [],
    };
}

function richTextContent(blocks, assets = []) {
    return {
        json: {
            nodeType: 'document',
            data: {},
            content: blocks,
        },
        links: {
            assets: {
                block: assets,
            },
        },
    };
}

const LOCAL_DUMMY_POSTS = [
    {
        sys: { id: 'local-lorem-ipsum-2', publishedAt: '2026-03-21T12:00:00Z' },
        title: 'Dolor Sit Amet: Local Preview Content',
        pullquote:
            'Clarity comes from turning abstract policy goals into small, testable improvements people can feel.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Local Dev Author',
        blogAuthorLink: '',
        tldr: 'Second placeholder post so the Ideas list has multiple cards.',
        content: richTextContent([
            heading1Node('From Strategy to Delivery'),
            paragraphNode(
                'Vivamus vitae nibh tincidunt, luctus erat et, tincidunt quam. Nullam egestas, nisl vitae pellentesque blandit, mauris ipsum placerat arcu, ut congue neque leo non erat.'
            ),
            paragraphNode(
                'Aliquam erat volutpat. Vestibulum eu odio at nisi volutpat interdum. Donec eu sem nec nisl accumsan commodo et vitae lectus.'
            ),
            paragraphNode(
                'Etiam suscipit eu nisi vel volutpat. Proin hendrerit augue at diam faucibus, ut facilisis felis feugiat. Cras commodo lorem ac lectus tincidunt, vel elementum lectus gravida.'
            ),
            paragraphNode(
                'Sed non orci est. Nam pretium, nulla ac facilisis posuere, diam mauris dapibus justo, at gravida leo odio a odio. Integer non ullamcorper velit.'
            ),
            embeddedAssetNode('dummy-img-2'),
            heading1Node('Creating Measurable Outcomes'),
            paragraphNode(
                'Ut sodales fermentum orci, sit amet volutpat tortor tincidunt quis. Maecenas in lacus dignissim, fringilla turpis sed, luctus justo. Duis at felis id ligula faucibus pretium vitae nec mi.'
            ),
            paragraphNode(
                'Integer nec lacus eu velit aliquam malesuada. Morbi molestie eleifend justo, et consequat tellus placerat vel. Nunc et lacinia eros, in fermentum enim.'
            ),
        ], [
            {
                sys: { id: 'dummy-img-2' },
                url: '/assets/img/Iceberg.webp',
                title: 'Iceberg illustration',
                description: 'An illustration of an iceberg',
            },
        ]),
    },
    {
        sys: { id: 'local-lorem-ipsum-3', publishedAt: '2026-03-15T12:00:00Z' },
        title: 'Quick Wins',
        pullquote:
            'Small, visible improvements build trust and create momentum for bigger delivery changes.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Verdance Team',
        blogAuthorLink: '',
        tldr: 'Short-title scenario for testing compact card headings.',
        content: richTextContent([
            heading1Node('Start With What Matters Most'),
            paragraphNode(
                'Teams can align quickly when they define a single user outcome and ship one measurable improvement around it.'
            ),
            paragraphNode(
                'Short cycles make it easier to learn, adjust scope, and keep stakeholders connected to real progress.'
            ),
        ]),
    },
    {
        sys: { id: 'local-lorem-ipsum-4', publishedAt: '2026-03-10T12:00:00Z' },
        title: 'How Cross-Functional Teams Turn Insight Into Better Services',
        pullquote:
            'Progress accelerates when policy, delivery, and operations shape outcomes together from day one.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Local Dev Author',
        blogAuthorLink: '',
        tldr: 'Medium-title scenario to validate two-line heading wrapping.',
        content: richTextContent([
            heading1Node('Working Across Boundaries'),
            paragraphNode(
                'Cross-functional delivery reduces handoffs and helps teams validate assumptions earlier in the process.'
            ),
            paragraphNode(
                'Shared ownership makes trade-offs explicit and improves the quality of decisions made under constraints.'
            ),
        ]),
    },
    {
        sys: { id: 'local-lorem-ipsum-5', publishedAt: '2026-03-05T12:00:00Z' },
        title: 'Designing Services Around Real User Moments',
        pullquote:
            'When teams map moments of friction, they can prioritize changes people actually notice.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Verdance Team',
        blogAuthorLink: '',
        tldr: 'Additional placeholder post to expand local feed testing scenarios.',
        content: richTextContent([
            heading1Node('Finding the Critical Journey'),
            paragraphNode(
                'Service design improves when teams focus on the specific moments where users hesitate, drop off, or ask for help.'
            ),
            paragraphNode(
                'A narrow, evidence-based scope helps teams ship improvements quickly and measure whether the change reduced friction.'
            ),
        ]),
    },
    {
        sys: { id: 'local-lorem-ipsum-6', publishedAt: '2026-02-28T12:00:00Z' },
        title: 'Building Confidence Through Transparent Delivery',
        pullquote:
            'Clear progress signals make it easier for leaders and teams to support sustained change.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Local Dev Author',
        blogAuthorLink: '',
        tldr: 'Another dummy post for list length and card variance testing.',
        content: richTextContent([
            heading1Node('Show the Work Early'),
            paragraphNode(
                'Regular demos and simple outcome metrics help stakeholders understand what is changing and why it matters.'
            ),
            paragraphNode(
                'Transparency reduces surprises, improves alignment, and creates space for earlier course corrections.'
            ),
        ]),
    },
];

module.exports = {
    LOCAL_DUMMY_POSTS,
};

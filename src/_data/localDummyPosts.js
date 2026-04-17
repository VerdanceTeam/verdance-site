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
        sys: { id: 'local-lorem-ipsum-1', publishedAt: '2026-04-01T12:00:00Z' },
        title: 'Lorem Ipsum: Building Better Public Services',
        pullquote:
            'The best service design starts with listening closely to the people who depend on it every day.',
        pullquoteImage: 'Sprout',
        blogAuthor: 'Verdance Team',
        blogAuthorLink: '',
        tldr: 'A placeholder post for local development and layout testing.',
        content: richTextContent([
            heading1Node('Why Service Design Matters'),
            paragraphNode(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non est nisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
            ),
            paragraphNode(
                'Suspendisse potenti. Praesent suscipit, nibh in aliquet fermentum, nibh ipsum pretium augue, vitae sodales purus lacus id lacus. Integer volutpat urna sed magna tincidunt, a pretium orci ullamcorper.'
            ),
            paragraphNode(
                'Curabitur ultrices, lectus vel lacinia fermentum, arcu mauris tempor odio, non dignissim erat libero quis augue. Donec id risus eu odio posuere consectetur et a magna.'
            ),
            paragraphNode(
                'Mauris faucibus, mi at blandit feugiat, tortor urna fringilla nisi, vitae tempor mauris libero eget mauris. Morbi ultrices malesuada justo, ac laoreet augue pretium vel.'
            ),
            embeddedAssetNode('dummy-img-1'),
            heading1Node('What Better Delivery Looks Like'),
            paragraphNode(
                'Phasellus at diam rutrum, sollicitudin arcu a, dignissim lorem. Integer id justo sit amet mauris elementum scelerisque quis non est. Sed semper justo vel elit feugiat, eget sagittis erat vulputate.'
            ),
            paragraphNode(
                'Donec et justo eget elit cursus pretium. Aenean blandit lacinia nisl, nec commodo velit maximus in. Integer gravida dui non arcu feugiat, sed tincidunt augue volutpat.'
            ),
        ], [
            {
                sys: { id: 'dummy-img-1' },
                url: '/assets/img/Gears.webp',
                title: 'Gears illustration',
                description: 'An illustration of interlocking gears',
            },
        ]),
    },
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
];

module.exports = {
    LOCAL_DUMMY_POSTS,
};

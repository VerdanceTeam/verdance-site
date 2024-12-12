module.exports = {
    version: 2,
    percy: {
        useSystemProxy: false,
    },
    snapshot: {
        widths: [700, 1200],
        minHeight: 1024,
        percyCSS: '',
        enableJavaScript: false,
        cliEnableJavaScript: true,
        disableShadowDOM: false,
    },
    discovery: {
        allowedHostnames: [],
        disallowedHostnames: [],
        networkIdleTimeout: 100,
        captureMockedServiceWorker: false,
        retry: false,
    },
    upload: {
        files: '**/*.{png,jpg,jpeg}',
        ignore: '',
        stripExtensions: false,
    },
    static: {
        include: [],
        exclude: [/our-work/i],
        rewrites: {},
        options: [],
    },
};

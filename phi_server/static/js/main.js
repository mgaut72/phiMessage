require.config({
    baseUrl: '/static/js',
    paths: {
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min',
        'react': '//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react',
        'rsvp': '//cdn.jsdelivr.net/rsvp/3.0/rsvp.amd.min',
        'sjcl': '//cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.0/sjcl.min'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        sjcl: {
            exports: 'sjcl'
        },
        'jsbn/rng': ['jsbn/prng4'],
        'jsbn/rsa': ['jsbn/jsbn', 'jsbn/rng'],
        'jsbn/rsa2': ['jsbn/jsbn2', 'jsbn/rsa'],
        'jsbn/jsbn2': ['jsbn/jsbn']
    }
});

require(['react', 'components/root', 'rsvp'],
function(React, Root, RSVP) {

    // Catch-all for errors within promises
    RSVP.on('error', function(reason) {
        console.assert(false, reason);
    });

    React.renderComponent(Root({}), document.body);

    console.log('ready');
});

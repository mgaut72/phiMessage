require.config({
    baseUrl: '/static/js',
    paths: {
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min',
        'react': '//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react',
        'rsvp': '//cdn.jsdelivr.net/rsvp/3.0/rsvp.amd.min'
    },
    shim: {
        underscore: {
            exports: '_'
        },
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

define(['socketio'], function(io) {
    return {
        messages: io.connect('/messages')
    };
});

define([], function() {
    var Session = function(username, device_id, keys) {
        
    };

    var getSession = function(username) {
        console.log('get session for user ' + username);
        return null;
    };

    return {
        getSession: getSession
    };

});

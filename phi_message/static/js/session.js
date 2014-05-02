define([], function() {
    var Session = function(username, device_id, keys) {
        
    };

    var getSession = function() {
        console.log('get session for user');
        var username = sessionStorage.getItem('username');
        var keys = sessionStorage.getItem('keys');
        if (username && keys) {
            return {
                username: username,
                keys: keys
            };
        }
        return null;
    };

    var saveSession = function(username, keys) {
        console.log('saving keys ' +  username);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('keys', JSON.stringify(keys));
        return {
            username: username,
            keys: keys
        };
    };

    return {
        getSession: getSession,
        saveSession: saveSession
    };

});

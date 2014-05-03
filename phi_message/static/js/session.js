define(['jsbn/jsbn2', 'ajax'], function(JSBN, AJAX) {

    var getSession = function() {
        console.log('get session for user');
        var username = sessionStorage.getItem('username');
        var keys = sessionStorage.getItem('keys');
        if (username && keys) {
            return {
                username: username,
                keys: JSONToKeys(JSON.parse(keys))
            };
        }
        return null;
    };

    var JSONToKeys = function(obj) {
        return obj;
    };

    var saveSession = function(username, keys) {
        keys = keysToJSON(keys);

        console.log('saving keys ' +  username);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('keys', JSON.stringify(keys));
        return {
            username: username,
            keys: keys
        };
    };

    var publish = function(username, keys) {

        var keysJSON = keysToJSON(keys);

        var rng = new SecureRandom();
        var deviceId = new BigInteger(256, 1, rng);

        var payload = {
            device_id: deviceId.toRadix(16),
            rsa: keysJSON.rsa.public,
            ecdsa: keysJSON.ecdsa.public
        };

        return AJAX.post('/keys/' + username, payload)
            .then(function(response) {
                saveSession(username, keys);
            });
    };

    var keysToJSON = function(keys) {
        return {
            rsa: {
                public: {
                    n: keys.rsa.n.toRadix(16),
                    e: keys.rsa.e.toString(16)
                }
            },
            ecdsa: {
                public: {
                    x: keys.ecdsa.publicKey.getX().toBigInteger().toRadix(16),
                    y: keys.ecdsa.publicKey.getY().toBigInteger().toRadix(16)
                }
            }
        };
    };

    return {
        getSession: getSession,
        saveSession: saveSession,
        publishKeys: publish
    };

});

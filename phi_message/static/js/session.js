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
        /*
        return {
            rsa: {
                
            },
            ecdsa: {

            }
        }
        */
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
                },
                private: {
                    coeff: keys.rsa.coeff.toRadix(16),
                    d: keys.rsa.d.toRadix(16),
                    dmp1: keys.rsa.dmp1.toRadix(16),
                    dmq1: keys.rsa.dmq1.toRadix(16),
                    p: keys.rsa.p.toRadix(16),
                    q: keys.rsa.q.toRadix(16)
                }
            },
            ecdsa: {
                public: {
                    x: keys.ecdsa.publicKey.getX().toBigInteger().toRadix(16),
                    y: keys.ecdsa.publicKey.getY().toBigInteger().toRadix(16),
                    z: keys.ecdsa.publicKey.z.toRadix(16)
                },
                private: {
                    k: keys.ecdsa.k.toRadix(16)
                }
            }
        };
    };

    var clear = function() {
        sessionStorage.clear();
    }

    return {
        getSession: getSession,
        saveSession: saveSession,
        publishKeys: publish,
        clear: clear
    };

});

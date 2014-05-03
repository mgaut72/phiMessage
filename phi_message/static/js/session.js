define(['jsbn/jsbn2', 'ajax', 'jsbn/ec', 'sockets', 'rsvp'], function(JSBN, AJAX, EC, Sockets, RSVP) {

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
            username: username,
            device_id: deviceId.toRadix(16),
            rsa: keysJSON.rsa.public,
            ecdsa: keysJSON.ecdsa.public
        };

        return new RSVP.Promise(function(resolve, reject) {
            Sockets.messages.emit('login', payload, function() {
                console.log('keys sent to server');
                resolve();
            });
        });
    };

    var JSONToKeys = function(keys) {
        var rsa = new RSAKey();
        rsa.setPrivateEx(keys.rsa.public.n,
            keys.rsa.public.e,
            keys.rsa.private.d,
            keys.rsa.private.p,
            keys.rsa.private.q,
            keys.rsa.private.dmp1,
            keys.rsa.private.dmq1,
            keys.rsa.private.coeff);

        var curve = secp256r1().getCurve();

        var point = new ECPointFp(curve,
            curve.fromBigInteger(parseBigInt(keys.ecdsa.public.x, 16)),
            curve.fromBigInteger(parseBigInt(keys.ecdsa.public.y, 16)),
            parseBigInt(keys.ecdsa.public.z));
        var k = parseBigInt(keys.ecdsa.private.k, 16);

        return {
            rsa: rsa,
            ecdsa: {
                publicKey: point,
                k: k
            }
        };
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
    };

    var getKeys = function(username) {
        return AJAX.get('/keys/' + username).then(function(keys) {
            console.log('keys for ' + username);
            return keys;
        });
    };

    return {
        getSession: getSession,
        saveSession: saveSession,
        publishKeys: publish,
        clear: clear,
        getKeys: getKeys
    };

});

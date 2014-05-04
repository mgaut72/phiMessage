define(['jsbn/jsbn2', 'ajax', 'jsbn/ec', 'sockets', 'rsvp', 'underscore', 'sjcl'], function(JSBN, AJAX, EC, Sockets, RSVP, _, SJCL) {

    var curve = SJCL.ecc.curves.c256;

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

    var parseECPoint = function(coords) {
        var x = SJCL.codec.hex.toBits(coords.x);
        var y = SJCL.codec.hex.toBits(coords.y);
        var point = curve.fromBits(SJCL.bitArray.concat(x, y));
        return new SJCL.ecc.ecdsa.publicKey(curve, point);
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


        var point = parseECPoint(keys.ecdsa.public);
        var k = SJCL.codec.hex.toBits(keys.ecdsa.private.k);
        k = SJCL.bn.fromBits(k);
        k = new SJCL.ecc.ecdsa.secretKey(curve, k);

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
                    x: SJCL.codec.hex.fromBits(keys.ecdsa.publicKey.get().x),
                    y: SJCL.codec.hex.fromBits(keys.ecdsa.publicKey.get().y),
                    z: "0"
                },
                private: {
                    k: SJCL.codec.hex.fromBits(keys.ecdsa.k.get())
                }
            }
        };
    };

    var clear = function() {
        sessionStorage.clear();
    };

    var getKeys = function(username) {
        return AJAX.get('/keys/' + username).then(function(response) {
            return _.map(response, function(keys) {
                var rsaKey = new RSAKey();
                rsaKey.setPublic(keys.rsa.n, keys.rsa.e);

                return {
                    id: keys.device_id,
                    rsa: rsaKey,
                    ecdsa: parseECPoint(keys.ecdsa)
                };
            });
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

define(['sjcl'], function(SJCL) {

    return {
        /*
         * Generate an ECDSA keypair (k, (x,y))
         */
        generate: function() {
            var keys = SJCL.ecc.ecdsa.generateKeys();
            console.log(keys);
            return {
                k: keys.sec,
                publicKey: keys.pub
            };
        },
        sign: function(k, publicKey, message) {
            console.log(SJCL.ecc);
            /*
            var hash = hex_sha1(message);
            console.log(hash);
            */
        }
    };
});

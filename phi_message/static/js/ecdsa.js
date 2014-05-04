define(['sjcl', 'jsbn/sha1'], function(SJCL, SHA1) {

    return {
        /*
         * Generate an ECDSA keypair (k, (x,y))
         */
        generate: function() {
            var keys = SJCL.ecc.ecdsa.generateKeys();
            return {
                k: keys.sec,
                publicKey: keys.pub
            };
        },
        sign: function(secretKey, publicKey, message) {
            var hash = hex_sha1(message);
            var hashBitArray = SJCL.codec.hex.toBits(hash);
            var signature = secretKey.sign(hashBitArray);
            return SJCL.codec.hex.fromBits(signature);
        }
    };
});

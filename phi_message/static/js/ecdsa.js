define(['jsbn/ec', 'jsbn/sec'], function(ECC, Curves) {
    return {
        generate: function() {
            var curve = secp256r1();
            var g = curve.getG();

            var rng = new SecureRandom();
            var k = new BigInteger(256, 1, rng);

            var publicKey = g.multiply(k);
            return {
                k: k,
                publicKey: publicKey
            };
        }
    };
});

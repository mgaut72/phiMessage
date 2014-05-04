define(['jsbn/ec', 'jsbn/sec'], function(ECC, Curves) {
    return {
        generate: function() {
            var curveParams = secp256r1();
            var g = curveParams.getG();
            var n = curveParams.getN();

            var rng = new SecureRandom();

            // choose random  k [0,n-1]
            var k = new BigInteger(256, 1, rng);
            while (k.compareTo(n) > 0)
                k = new BigInteger(256, 1, rng);

            var publicKey = g.multiply(k);
            return {
                k: k,
                publicKey: publicKey
            };
        }
    };
});

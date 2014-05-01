define(['jsbn/rsa', 'jsbn/rsa2'], function() {

    /*
     * Shared public exponent for RSA public-key cryptosystem
     * http://en.wikipedia.org/wiki/RSA_(cryptosystem)
     *
     * Commonly called 'e', e should be relatively prime to p-1 for all primes
     * p which divide the modulus.
     *
     * There is no known attack against small public exponents such as e = 3,
     * provided that proper padding is used. Coppersmith's Attack has many
     * applications in attacking RSA specifically if the public exponent e is
     * small and if the encrypted message is short and not padded. 65537 is a
     * commonly used value for e; this value can be regarded as a compromise
     * between avoiding potential small exponent attacks and still allowing
     * efficient encryptions (or signature verification). The NIST Special
     * Publication on Computer Security (SP 800-78 Rev 1 of August 2007) does not
     * allow public exponents e smaller than 65537, but does not state a reason
     * for this restriction.
     *
     * Here, 'e' is encoded in base-16 and represents the value 65537
     */
    var PUBLIC_EXPONENT = "10001";

    return {
        generate: function() {
            var key = new RSAKey();
            key.generate(1280, PUBLIC_EXPONENT);
            return key;
        }
    };
});

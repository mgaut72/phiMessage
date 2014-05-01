define(['jsbn/rsa', 'jsbn/rsa2'], function() {

    /*
     * RSA Public Exponent
     */
    var PUBLIC_EXPONENT = "101";

    return {
        generate: function() {
            var key = new RSAKey();
            key.generate(1280, PUBLIC_EXPONENT);
            return key;
        }
    };
});

define(['sjcl', 'jsbn/ec', 'jsbn/rng', 'jsbn/rsa'], function(SJCL, EC, RNG, RSA) {

    var rng = new SecureRandom();

    /*
     * message is padded with ??? and encrypted with AES running in CCM mode
     * key is padded with PKCS#1 and encrypted with RSA
     */
    function encrypt(plaintext, senderKeys, recipientKeys) {

        // generate a random 128-bit AES key
        var k = new BigInteger(128, 1, rng);
        var AESKeyHex = k.toRadix(16);
        var AESKeyBitArray = sjcl.codec.hex.toBits(AESKeyHex);
        console.log(AESKeyHex);

        // encrypt message with AES
        var ciphertext = sjcl.encrypt(AESKeyBitArray, plaintext);
        console.log(ciphertext);

        // encrypt key with RSA
        var encryptedKey = recipientKeys.rsa.encrypt(AESKeyHex);
        console.log(encryptedKey);

        return {
            message: {
                content: ciphertext,
                signature: ''
            },
            key: {
                content: encryptedKey,
                signature: ''
            }
        }
    };

    function decrypt(message, senderKeys, recipientKeys) {
    };

    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
});

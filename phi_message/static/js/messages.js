define(['sjcl', 'jsbn/ec', 'jsbn/rng', 'jsbn/rsa', 'ecdsa'], function(SJCL, EC, RNG, RSA, ECDSA) {

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

        // encrypt message with AES
        var ciphertext = sjcl.encrypt(AESKeyBitArray, plaintext);

        // encrypt key with RSA
        var encryptedKey = recipientKeys.rsa.encrypt(AESKeyHex);


        var sign = ECDSA.sign.bind(null, senderKeys.ecdsa.k, senderKeys.ecdsa.publicKey);

        return {
            message: {
                content: ciphertext,
                signature: sign(ciphertext),
                plaintext: plaintext
            },
            key: {
                content: encryptedKey,
                signature: sign(encryptedKey),
                plaintext: AESKeyHex
            }
        }
    };

    function decrypt(message, senderKeys, recipientKeys) {
        console.log(arguments);
        console.log('decrypting');

        // verify signature of key and message
        var verify = ECDSA.verify.bind(null, senderKeys.ecdsa);
        verify(message.key.content, message.key.signature);
        verify(message.message.content, message.message.signature);
    };

    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
});

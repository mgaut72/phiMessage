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
        // verify signature of key and message
        var verify = ECDSA.verify.bind(null, senderKeys.ecdsa);
        verify(message.key.content, message.key.signature);
        verify(message.message.content, message.message.signature);

        // decipher key
        var AESKeyHex = recipientKeys.rsa.decrypt(message.key.content);
        var AESKeyBitArray = sjcl.codec.hex.toBits(AESKeyHex);

        // decipher message
        var plaintext = sjcl.decrypt(AESKeyBitArray, message.message.content);

        return {
            message: {
                content: message.message.content,
                signature: message.message.signature,
                plaintext: plaintext
            },
            key: {
                content: message.key.content,
                signature: message.key.signature,
                plaintext: AESKeyHex
            }
        };
    };

    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
});

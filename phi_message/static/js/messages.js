define([], function() {

    function encrypt(message, senderKeys, recipientKeys) {
        console.log(arguments);
        return {
            message: {
                content: '',
                signature: ''
            },
            key: {
                content: '',
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

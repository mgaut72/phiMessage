# phiMessage Protocol Specification

## Key Generation for Alice

Key generation happens for any *new* device when you log in.

1. Generate a random device id, save it in HTML5 LocalStorage
2. Generate RSA (1280-bit) & ECDSA (256-bit) key pairs, save them in HTML5 LocalStorage
3. Emit to the `/messages` socket namespace a `login` event with the following data:

```javascript
{
    "username": "Alice"
    "device_id": "1cda4928ed8592834bfe834"
    "rsa": {
        "n": "121240913402934234234092385234",
        "e": "29384029384029350295098309238049"
    },
    "ecdsa": {
        "x": "28795287349abcdef",
        "y": "82349287398afdcedface"
    }
}
```

## Sending a Message to Bob

1. GET /keys/bob
2. For each of Bob’s keys k_i:
   * Select a random AES-128 key k
   * Encrypt m with AES-128 with key k = aes(m)
   * Encrypt k with RSA  = rsa(k)
   * Sign SHA-1(aes(m)) with ECDSA
   * Sign SHA-1(rsa(k)) with ECDSA
3. emit to the namespace `/messages` with the event called `message`

```javascript
{
    "sender": "bob",
    "ciphertext": [
        {
            "device_id": "82734982735982705893745092387405298",
            "message": {
                "content": "92837498237498abce987987fed",
                "signature": "2384092359080fedce"
            },
            "key": {
                "content": "abcdef123456789abc123",
                "signature": "238497234ab"
            }
        },
        .
        .
        .
    ]
}
```

## Receiving a Message from Alice

Messages will be recived on a socket namespace `/messages` tagged with an event called `<my device id>`

```javascript
{
    "sender": "bob",
    "message": {
        "content": "92837498237498abce987987fed",
        "signature": "2384092359080fedce"
    },
    "key": {
        "content": "abcdef123456789abc123",
        "signature": "238497234ab"
    }
}
```

1. GET /keys/alice
2. Compute SHA-1 digests of message.content and key.content
3. Verify key.signature & message.signature with Alice’s ECDSA public keys
4. Decipher key.content with RSA decryption key
5. Decipher message.content with deciphered AES key

## Getting the currently active users

Every time someone connects or disconnects, an event called `users` on the
`/messages` namespace will occur, with the contents having the following
structure:

```javascript
{
    "users": ["Eve", "Bob", "Alice"]
}
```

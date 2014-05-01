define(['rsvp'], function(RSVP) {

    var getJSON = function(url) {
        var promise = new RSVP.Promise(function(resolve, reject) {
            var client = new XMLHttpRequest();
            client.open("GET", url);
            client.onreadystatechange = handler;
            client.responseType = "json";
            client.setRequestHeader("Accept", "application/json");
            client.send();

            function handler() {
                if (this.readyState === this.DONE) {
                    if (this.status === 200) { resolve(this.response); }
                    else { reject(this); }
                }
            };
        });

        return promise;
    };

    var postJSON = function(url, payload) {
        var promise = new RSVP.Promise(function(resolve, reject) {
            var client = new XMLHttpRequest();
            client.open("POST", url);
            client.onreadystatechange = handler;
            client.responseType = "json";
            client.setRequestHeader("Accept", "application/json");
            client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            client.send(JSON.stringify(payload));

            function handler() {
                if (this.readyState === this.DONE) {
                    if (this.status === 200) { resolve(this.response); }
                    else { reject(this); }
                }
            };
        });

        return promise;
    };

    return {
        publish: function(username, rsaKey, ecdsaKey) {
            var payload = {
                device_id: "1234",
                rsa: {
                    n: rsaKey.n.toRadix(16),
                    e: rsaKey.e.toString(16)
                },
                ecdsa: {
                    x: ecdsaKey.publicKey.getX().toBigInteger().toRadix(16),
                    y: ecdsaKey.publicKey.getY().toBigInteger().toRadix(16)
                }
            };
            return postJSON('/keys/' + username, payload);
        }
    };

});

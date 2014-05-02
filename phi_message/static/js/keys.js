define(['rsvp', 'jsbn/jsbn2'], function(RSVP, JSBN) {

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
        publish: function(username, keys) {

            var rng = new SecureRandom();
            var deviceId = new BigInteger(256, 1, rng);

            var payload = {
                device_id: deviceId.toRadix(16),
                rsa: keys.rsa,
                ecdsa: keys.ecdsa
            };

            return postJSON('/keys/' + username, payload);
        }
    };

});

define(['react', 'rsa', 'ecdsa', 'session', 'sjcl', 'components/key_field'], function(React, RSA, ECDSA, Session, SJCL, KeyField) {

    var GenerateRSA = React.createClass({
        componentDidMount: function() {
            this.props.generateKeys();
        },
        render: function() {

            var content;
            if (this.props.keys) {
                content = React.DOM.form({className: 'form-horizontal', role: 'form'},
                    KeyField({name: 'p', content: this.props.keys.p, type: 'private'}),
                    KeyField({name: 'q', content: this.props.keys.q, type: 'private'}),
                    KeyField({name: 'n', content: this.props.keys.n, type: 'public'}),
                    KeyField({name: 'e', content: this.props.keys.e, type: 'public'}),
                    KeyField({name: 'd', content: this.props.keys.d, type: 'private'}));
            } else {
                content = React.DOM.div({}, "busy");
            }

            return React.DOM.div({},
                React.DOM.h2({}, "Generate an RSA Key Pair"),
                React.DOM.p({}, "We'll be using RSA for transmitting keys. Below are keys we generated for you:"),
                content);
        }
    });

    var GenerateECDSA = React.createClass({
        componentDidMount: function() {
            this.props.generateKeys();
        },
        render: function() {

            var content;
            if (this.props.keys) {
                console.log(SJCL);
                content = React.DOM.form({className: 'form-horizontal', role: 'form'},
                    KeyField({name: 'k', content: SJCL.codec.hex.fromBits(this.props.keys.k), type: 'private'}),
                    KeyField({name: 'x', content: SJCL.codec.hex.fromBits(this.props.keys.x), type: 'public'}),
                    KeyField({name: 'y', content: SJCL.codec.hex.fromBits(this.props.keys.y), type: 'public'}));
            } else
                content = React.DOM.div({}, "busy");

            return React.DOM.div({},
                React.DOM.h2({}, "Generate an ECDSA Key Pair"),
                React.DOM.p({}, "We'll be using the Elliptic Curve Digital Signature Algorithm for verifying the authenticity of messages. Below are keys we generated for you:"),
                content);
        }
    });

    var PublishKeys = React.createClass({
        componentDidMount: function() {
            this.props.publishKeys();
        },
        render: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Send public keys over to our servers"),
                React.DOM.p({}, "We'll hold onto your public keys so that your friends can use them to send you messages."));
        }
    });

    var KeyGenerationWizard = React.createClass({
        getInitialState: function() {
            return {
                step: 0,
                sendingComplete: false,
                keys: {
                    rsa: null,
                    ecdsa: null
                }
            }
        },
        generateRSAKeys: function() {
            console.log('generating rsa keys');
            var key = RSA.generate();
            this.state.keys.rsa = key;
            this.setState({keys: this.state.keys});
        },
        generateECDSAKeys: function() {
            console.log('generating ecdsa keys');
            var key = ECDSA.generate();
            this.state.keys.ecdsa = key;
            this.setState({keys: this.state.keys});
        },
        nextStep: function() {
            this.setState({step: this.state.step + 1});
        },
        publishKeys: function() {
            Session.saveSession(this.props.username, this.state.keys);
            window.setTimeout(function() {
                this.setState({sendingComplete: true});
            }.bind(this), 1000);
        },
        intro: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Key Generation"),
                React.DOM.p({}, "To begin using \uD835\uDF11Message, we must first generate some cryptographic keys. To begin, click 'Next'."));
        },
        rsa: function() {
            var keys;
            if (this.state.keys.rsa)
                keys = {
                    p: this.state.keys.rsa.p,
                    q: this.state.keys.rsa.q,
                    n: this.state.keys.rsa.n,
                    e: this.state.keys.rsa.e,
                    d: this.state.keys.rsa.d
                };

            return GenerateRSA({
                keys: keys,
                generateKeys: this.generateRSAKeys
            });
        },
        ecdsa: function() {
            var keys;
            if (this.state.keys.ecdsa) {
                var key = this.state.keys.ecdsa;
                keys = {
                    k: key.k.get(),
                    x: key.publicKey.get().x,
                    y: key.publicKey.get().y
                };
            }

            return GenerateECDSA({
                keys: keys,
                generateKeys: this.generateECDSAKeys
            });
        },
        transmit: function() {
            return PublishKeys({publishKeys: this.publishKeys});
        },
        finish: function() {
            console.log(this.state);
            this.props.onFinish();
        },
        render: function() {
            var steps = [this.intro, this.rsa, this.ecdsa, this.transmit];
            var onFinalStep = this.state.step == steps.length - 1;
            return React.DOM.div({},
                steps[this.state.step](),
                onFinalStep ?
                React.DOM.button({className: 'btn btn-primary',
                    onClick: this.finish,
                    disabled: !this.state.sendingComplete
                }, this.state.sendingComplete ? "Finish" : "Sending") :
                React.DOM.button({className: 'btn btn-primary', onClick: this.nextStep}, "Next"));
        }
    });

    return KeyGenerationWizard;
});

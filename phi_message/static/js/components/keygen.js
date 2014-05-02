define(['react', 'rsa', 'ecdsa', 'keys'], function(React, RSA, ECDSA, Keys) {

    var KeyField = React.createClass({
        render: function() {
            return React.DOM.div({className: 'form-group'},
                React.DOM.label({}, this.props.name),
                React.DOM.input({className: 'form-control', value: this.props.content, readOnly: true}));
        }
    });

    var GenerateRSA = React.createClass({
        componentDidMount: function() {
            this.props.generateKeys();
        },
        render: function() {

            var content;
            if (this.props.keys) {
                content = React.DOM.div({},
                    KeyField({name: 'p', content: this.props.keys.p}),
                    KeyField({name: 'q', content: this.props.keys.q}),
                    KeyField({name: 'n', content: this.props.keys.n}),
                    KeyField({name: 'e', content: this.props.keys.e}),
                    KeyField({name: 'd', content: this.props.keys.d}));
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
                content = React.DOM.div({},
                    KeyField({name: 'e', content: this.props.keys.e}),
                    KeyField({name: 'x', content: this.props.keys.x.toBigInteger().toString()}),
                    KeyField({name: 'y', content: this.props.keys.y.toBigInteger().toString()}));
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
            console.log(this.state.keys);
            Keys.publish(this.props.username,
                this.state.keys.rsa,
                this.state.keys.ecdsa)
                .then(function() {
                    this.setState({sendingComplete: true});
                }.bind(this));
        },
        intro: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Key Generation"),
                React.DOM.p({}, "To being using \uD835\uDF11message, we must first generate some cryptographic keys. To begin, click 'Next'."));
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
                    e: key.e,
                    x: key.publicKey.getX(),
                    y: key.publicKey.getY()
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
        render: function() {
            console.log(this.state);
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

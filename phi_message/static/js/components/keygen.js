define(['react', 'rsa'], function(React, RSA) {

    var GenerateRSA = React.createClass({
        componentDidMount: function() {
            this.props.generateKeys();
        },
        render: function() {

            var content;
            if (this.props.keys) {
                content = React.DOM.dl({},
                    React.DOM.dt({}, "p"),
                    React.DOM.dd({}, this.props.keys.p),
                    React.DOM.dt({}, "q"),
                    React.DOM.dd({}, this.props.keys.q),
                    React.DOM.dt({}, "n"),
                    React.DOM.dd({}, this.props.keys.n),
                    React.DOM.dt({}, "e"),
                    React.DOM.dd({}, this.props.keys.e),
                    React.DOM.dt({}, "d"),
                    React.DOM.dd({}, this.props.keys.d));
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
                content = React.DOM.dl({},
                    React.DOM.dt({}, "x"),
                    React.DOM.dd({}, this.props.keys.x),
                    React.DOM.dt({}, "y"),
                    React.DOM.dd({}, this.props.keys.y),
                    React.DOM.dt({}, "e \u00D7 (x,y)"),
                    React.DOM.dd({}, this.props.keys.product));
            } else
                content = React.DOM.div({}, "busy");

            return React.DOM.div({},
                React.DOM.h2({}, "Generate an ECDSA Key Pair"),
                React.DOM.p({}, "We'll be using the Elliptic Curve Digital Signature Algorithm for verifying the authenticity of messages. Below are keys we generated for you:"),
                content);
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
            this.setState({keys: {rsa: key}});
        },
        generateECDSAKeys: function() {
            console.log('generating ecdsa keys');
            setTimeout(function() {
                this.setState({keys: {ecdsa: {
                    x: "0x9aeb1ed8cd7d13eb9cbeaa78b4f2f0cb",
                    y: "0xd7ce3b30fabae3cb11c16d24ffdedc8c",
                    product: "0xcbbf7c7da5a19ff6cff50b7ea226be97"
                }}});
            }.bind(this), 1000);
        },
        nextStep: function() {
            this.setState({step: this.state.step + 1});
        },
        intro: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Key Generation"),
                "To being using \u03C6-Message, we must first generate some cryptographic keys. To begin, click 'Next'.");
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
            return GenerateECDSA({keys: this.state.keys.ecdsa, generateKeys: this.generateECDSAKeys});
        },
        transmit: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Send public keys over to our servers"),
                React.DOM.p({}, "We'll hold onto your public keys so that your friends can use them to send you messages."));
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

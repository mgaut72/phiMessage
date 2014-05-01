define(['react', 'session'], function(React, Session) {

    var applicationName = "\u03C6-Message";

    var Header = React.createClass({
        render: function() {
            return React.DOM.header({},
                React.DOM.h1({}, applicationName));
        }
    });

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
            setTimeout(function() {
                this.setState({keys: {rsa: {
                    p: "0x9aeb1ed8cd7d13eb9cbeaa78b4f2f0cb",
                    q: "0xd7ce3b30fabae3cb11c16d24ffdedc8c",
                    n: "0xcbbf7c7da5a19ff6cff50b7ea226be97",
                    e: "0xa179cfbe6e53735818ef5eb5b7cd61b9",
                    d: "0xdcc9db270ff09b4dea40f5aefb153caf"
                }}});
            }.bind(this), 1000);
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
                "To being using " + applicationName + ", we must first generate some cryptographic keys. To begin, click 'Next'.");
        },
        rsa: function() {
            return GenerateRSA({keys: this.state.keys.rsa, generateKeys: this.generateRSAKeys});
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

    var LoginForm = React.createClass({
        getInitialState: function() {
            return {
                username: '',
                password: ''
            };
        },
        handleSubmit: function(e) {
            e.preventDefault();
            this.props.onLogin(this.state.username);
        },
        render: function() {
            return React.DOM.form({onSubmit: this.handleSubmit, role: 'form'},
                React.DOM.div({className: 'form-group'},
                    React.DOM.label({}, "Username: "),
                    React.DOM.input({
                        className: 'form-control',
                        type: 'text',
                        value: this.state.username,
                        onChange: function(e) {
                            this.setState({username: e.target.value});
                        }.bind(this)
                    })),
                React.DOM.div({className: 'form-group'},
                    React.DOM.label({}, "Password: "),
                    React.DOM.input({
                        className: 'form-control',
                        type: 'password',
                        value: this.state.password,
                        onChange: function(e) {
                            this.setState({password: e.target.value});
                        }.bind(this)
                    })),
                React.DOM.button({className: 'btn btn-primary'}, "Login"));
        }
    });

    var Login = React.createClass({
        render: function() {
            return React.DOM.div({},
                React.DOM.p({}, "Welcome to " + applicationName + "! Please log in!"),
                LoginForm({onLogin: this.props.onLogin}));
        }
    });

    return React.createClass({
        getInitialState: function() {
            return {
                username: null,
                session: null
            };
        },
        handleLogin: function(username) {
            this.setState({
                username: username,
                session: Session.getSession(username)
            });
        },
        render: function() {
            var content;
            if (this.state.username) {
                if (this.state.session)
                    content = React.DOM.div({}, "Welcome, " + this.state.username);
                else
                    content = KeyGenerationWizard({});
            } else
                content = Login({onLogin: this.handleLogin});

            return React.DOM.div({},
                Header(),
                content);
        }
    });
});

define(['react', 'underscore', 'session', 'sockets', 'messages', 'components/key_field'], function(React, _, Session, Sockets, Messages, KeyField) {

    var UserList = React.createClass({
        handleClick: function(user, e) {
            e.preventDefault();
            this.props.onSelectContact(user);
        },
        render: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Online Users"),
                React.DOM.ul({id: 'user-list', className: 'nav nav-pills nav-stacked'},
                    _.map(this.props.users, function(user) {
                        var messages = this.props.messages[user] || [];
                        var numUnread = _.filter(messages, function(msg) {
                            return !msg.decrypted;
                        }).length;
                        var badge;
                        if (numUnread > 0)
                            badge = React.DOM.span({className: 'badge pull-right'}, numUnread);
                        return React.DOM.li({key: user},
                            React.DOM.a({href: '#', onClick: this.handleClick.bind(this, user)}, badge, user));
                    }.bind(this))));
        }
    });

    var ComposeMessage = React.createClass({
        getInitialState: function() {
            return {
                plaintext: ''
            };
        },
        handlePlaintextChange: function(e) {
            this.setState({plaintext: e.target.value});
        },
        handleSubmit: function(e) {
            e.preventDefault();
            console.log('encrypt');
            this.props.onSubmit(this.state.plaintext);
        },
        render: function() {
            return React.DOM.div({},
                React.DOM.form({className: 'form-inline', role: 'form', onSubmit: this.handleSubmit},
                    React.DOM.div({className: 'form-group'},
                        React.DOM.textarea({
                            value: this.state.plaintext,
                            placeholder: 'Type a message here.',
                            className: 'form-control',
                            onChange: this.handlePlaintextChange})),
                    React.DOM.input({type: 'submit', className: 'btn btn-primary', value: 'Encrypt'})));
        }
    });

    var MessageList = React.createClass({
        render: function() {
            var items = _.map(this.props.messages, function(msg) {
                return React.DOM.li({className: msg.type}, msg.content);
            });
            return React.DOM.ul({id: 'message-list'},
                items);
        }
    });

    var Conversation = React.createClass({
        getInitialState: function() {
            return {
                step: 0,
                message: null,
                plaintext: null
            };
        },
        handleSendMessage: function(plaintext) {
            var result = this.props.encrypt(this.props.contact, plaintext);
            this.setState({step: 1, message: result, plaintext: plaintext});
        },
        nextStep: function() {
            this.setState({step: this.state.step + 1});
        },
        sendMessage: function() {
            this.props.onSendMessage(this.state.message, this.state.plaintext);
            this.setState({message: null, step: 0, plaintext: null});
        },
        steps: {
            compose: function() {
                return React.DOM.div({},
                    MessageList({messages: this.props.messages}),
                    ComposeMessage({contact: this.props.contact,
                        onSubmit: this.handleSendMessage}));
            },
            selectKeys: function() {
                var keys = _.map(this.state.message, function(device, idx) {
                    console.log(device.key.plaintext);
                    return KeyField({
                        name: "Device " + (idx + 1),
                        content: device.key.plaintext});
                });

                return React.DOM.div({},
                    React.DOM.h2({}, "Selecting Keys"),
                    React.DOM.p({}, "We're going to encrypt your message for each of " + this.props.contact + "'s devices, so we'll start by picking random 128-bit AES keys for each one. Each key here is represented in hexadecimal."),
                    React.DOM.form({className: 'form-horizontal', role: 'form'}, keys),
                    React.DOM.button({className: 'btn btn-default', onClick: this.nextStep}, "Next"));
            },
            encryptMessage: function() {
                var ciphertexts = _.map(this.state.message, function(device, idx) {
                    var params = JSON.parse(device.message.content);
                    return [
                        KeyField({
                            name: "Device " + (idx + 1) + " IV",
                            content: params.iv}),
                        KeyField({
                            name: "Device " + (idx + 1) + " Ciphertext",
                            content: params.ct})
                    ]
                });
                return React.DOM.div({},
                    React.DOM.h2({}, "Encipher Message"),
                    React.DOM.p({}, "Now, we'll encipher your message to " + this.props.contact + " with AES running in CCM mode, with a randomly selected initialization vector (IV). Here, both the IVs and the ciphertexts are displayed in base 64."),
                    React.DOM.form({className: 'form-horizontal', role: 'form'}, ciphertexts),
                    React.DOM.button({className: 'btn btn-default', onClick: this.nextStep}, "Next"));
            },
            encryptKeys: function() {
                var ciphertexts = _.map(this.state.message, function(device, idx) {
                    return KeyField({
                        name: "Device " + (idx + 1) + " Key",
                        content: device.key.content});
                });

                return React.DOM.div({},
                    React.DOM.h2({}, "Encipher Keys"),
                    React.DOM.p({}, "Now your message is encrypted with AES, but we also need to send the key and initialization vector to " + this.props.contact + ". To do this, we'll encrypt these items with " + this.props.contact + "'s public RSA encryption key."),
                    React.DOM.form({className: 'form-horizontal', role: 'form'}, ciphertexts),
                    React.DOM.button({className: 'btn btn-default', onClick: this.nextStep}, "Next"));
            },
            signMessage: function() {
                var ciphertexts = _.map(this.state.message, function(device, idx) {
                    return KeyField({
                        name: "Device " + (idx + 1) + " Signature",
                        content: device.message.signature});
                });

                return React.DOM.div({},
                    React.DOM.h2({}, "Sign Message"),
                    React.DOM.p({}, "We'll use ECDSA to sign your message so " + this.props.contact + " can verify that you are the one who sent it. We'll compute the message hash, and sign the hash for each device"),
                    React.DOM.form({className: 'form-horizontal', role: 'form'}, ciphertexts),
                    React.DOM.button({className: 'btn btn-default', onClick: this.nextStep}, "Next"));
            },
            finish: function() {
                return React.DOM.div({},
                    React.DOM.h2({}, "Finished!"),
                    React.DOM.p({}, "We've finished all of the work we need to do to make sure that an attacker cannot read your message to " + this.props.contact + " or forge any messages, while still making it possible for " + this.props.contact + " to read it. Now we can be confident that our message is safe in transit."),
                    React.DOM.button({className: 'btn btn-default', onClick: this.sendMessage}, "Finish"));
            }
        },
        handleBackClick: function(e) {
            e.preventDefault();
            this.props.onReturn();
        },
        render: function() {
            if (!this.props.contact)
                return React.DOM.div({id: 'conversation', className: 'inactive'});
            
            console.log('step', this.state.step);
            var steps = [
                this.steps.compose,
                this.steps.selectKeys,
                this.steps.encryptMessage,
                this.steps.encryptKeys,
                this.steps.signMessage,
                this.steps.finish
            ];

            return React.DOM.div({id: 'conversation', className: 'active'},
                React.DOM.h2({}, React.DOM.a({href: '#', onClick: this.handleBackClick}, React.DOM.i({className: 'glyphicon glyphicon-arrow-left'})), " " + this.props.contact),
                steps[this.state.step].bind(this)());
        }
    });

    var Application = React.createClass({
        getInitialState: function() {
            return {
                messages: {},
                users: [],
                keys: {}, // user: key map
                contact: null
            };
        },
        handleRequestKeys: function(contact) {
            console.log('get keys for contact ' + contact);
            return Session.getKeys(contact).then(function(keys) {
                if (keys.length === 0)
                    console.warn('no keys for contact');
                this.state.keys[contact] = keys;
                this.setState({keys: this.state.keys});
                return keys;
            }.bind(this));
        },
        handleSelectContact: function(contact) {
            this.setState({contact: contact});
            this.handleRequestKeys(contact);
        },
        sendMessage: function(ciphertext, plaintext) {
            var payload = {
                sender: this.props.session.username,
                sender_device_id: this.props.session.deviceId.toRadix(16),
                ciphertext: _.map(ciphertext, function(ct) {
                    return {
                        device_id: ct.device_id,
                        message: {
                            content: ct.message.content,
                            signature: ct.message.signature
                        },
                        key: {
                            content: ct.key.content,
                            signature: ct.key.signature
                        }
                    };
                })
            };

            Sockets.messages.emit('message', payload);
            this.addMessage(this.state.contact, plaintext, 'sent');
        },
        addMessage: function(contact, plaintext, type, data) {
            var messages = this.state.messages;
            if (messages[contact] === undefined)
                messages[contact] = [];
            messages[contact].push({
                type: type,
                content: plaintext,
                decrypted: type == 'sent',
                data: data
            });
            console.log(messages[contact]);
            this.setState({messages: messages});
        },
        login: function() {
            Session.publishKeys(this.props.session.username, this.props.session.deviceId, this.props.session.keys);
        },
        encrypt: function(recipient, plaintext) {
            var devices = this.state.keys[this.state.contact];
            var result = _.map(devices, function(device) {
                var encrypted = Messages.encrypt(plaintext, this.props.session.keys, device);
                return {
                    device_id: device.id,
                    message: encrypted.message,
                    key: encrypted.key
                };
            }.bind(this));
            console.log(result);
            return result;
        },
        listenForUsers: function() {
            Sockets.messages.on('users', function(msg) {
                console.log(msg.users);
                var users = _.reject(msg.users, function(user) {
                    return user == this.props.session.username;
                }.bind(this));
                this.setState({users: users});
            }.bind(this));
        },
        listenForMessages: function() {
            console.log('listening for messages on ' + this.props.session.deviceId.toRadix(16));
            Sockets.messages.on(this.props.session.deviceId.toRadix(16), function(message) {
                console.log('received message');
                console.log(message);
                this.handleRequestKeys(message.sender).then(function(keys) {
                    console.log(keys);
                    var deviceKeys = _.find(keys, function(key) {
                        return key.id == message.sender_device_id;
                    });
                    console.log(deviceKeys);
                    var decrypted = Messages.decrypt(message, deviceKeys, this.props.session.keys);
                    this.addMessage(message.sender, decrypted.message.plaintext, 'received', decrypted);
                }.bind(this));
            }.bind(this));
        },
        componentDidMount: function() {
            this.listenForUsers();
            this.listenForMessages();
            this.login();
        },
        handleReturn: function() {
            this.setState({contact: null});
        },
        render: function() {
            return React.DOM.div({id: 'application'},
                this.state.contact ?
                Conversation({messages: this.state.messages[this.state.contact],
                    contact: this.state.contact,
                    encrypt: this.encrypt,
                    onSendMessage: this.sendMessage,
                    onReturn: this.handleReturn}) :
                UserList({users: this.state.users,
                    messages: this.state.messages,
                    onSelectContact: this.handleSelectContact}));
        }
    });

    return Application;
});

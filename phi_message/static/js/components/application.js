define(['react', 'underscore', 'session', 'sockets', 'messages'], function(React, _, Session, Sockets, Messages) {

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
                        return React.DOM.li({key: user},
                            React.DOM.a({href: '#', onClick: this.handleClick.bind(this, user)}, user));
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

    var Conversation = React.createClass({
        encryptMessage: function(plaintext) {
            console.log('encrypting');
            var result = _.map(this.props.contactDevices, function(device) {
                var encrypted = Messages.encrypt(plaintext, this.props.session.keys, device);
                return {
                    device_id: device.id,
                    message: encrypted.message,
                    key: encrypted.key
                };
            }.bind(this));
            console.log(result);
            this.sendMessage(result);
        },
        sendMessage: function(ciphertext) {
            var payload = {
                sender: this.props.session.username,
                ciphertext: ciphertext
            };
            Sockets.messages.emit('message', payload);
        },
        render: function() {
            if (!this.props.contact)
                return React.DOM.div({id: 'conversation', className: 'inactive'});
            return React.DOM.div({id: 'conversation', className: 'active'},
                React.DOM.h2({}, this.props.contact),
                ComposeMessage({contact: this.props.contact,
                    onSubmit: this.encryptMessage}));
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
            Session.getKeys(contact).then(function(keys) {
                this.state.keys[contact] = keys;
                this.setState({keys: this.state.keys});
            }.bind(this));
        },
        handleSelectContact: function(contact) {
            this.setState({contact: contact});
            this.handleRequestKeys(contact);
        },
        login: function() {
            Session.publishKeys(this.props.session.username, this.props.session.keys);
        },
        listenForUsers: function() {
            Sockets.messages.on('users', function(msg) {
                console.log(msg.users);
                this.setState({users: msg.users});
            }.bind(this));
        },
        componentDidMount: function() {
            this.listenForUsers();
            this.login();
        },
        render: function() {
            return React.DOM.div({id: 'application'},
                UserList({users: this.state.users,
                    onSelectContact: this.handleSelectContact}),
                Conversation({messages: this.state.messages[this.state.contact],
                    contact: this.state.contact,
                    session: this.props.session,
                    contactDevices: this.state.keys[this.state.contact]}));
        }
    });

    return Application;
});

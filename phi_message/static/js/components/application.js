define(['react', 'underscore'], function(React, _) {

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

    var Conversation = React.createClass({
        requestKeys: function(props) {
            if (props.contact && !props.contactKeys)
                props.onRequestKeys(props.contact);
        },
        componentDidMount: function() {
            this.requestKeys(this.props);
        },
        componentWillReceiveProps: function(nextProps) {
            this.requestKeys(nextProps);
        },
        render: function() {
            if (!this.props.contact)
                return React.DOM.div({id: 'conversation', className: 'inactive'});
            return React.DOM.div({id: 'conversation', className: 'active'},
                React.DOM.h2({}, this.props.contact));
        }
    });

    var Application = React.createClass({
        getInitialState: function() {
            return {
                messages: {},
                users: {},      // user: key map
                contact: null
            };
        },
        handleRequestKeys: function(contact) {
            console.log('get keys for contact ' + contact);
        },
        handleSelectContact: function(contact) {
            this.setState({contact: contact});
        },
        componentDidMount: function() {
            var fakeUsers = ['matt', 'taylor', 'chris', 'daniel'];
            _.each(fakeUsers, function(user, i) {
                setTimeout(function(k) {
                    var users = this.state.users;
                    users[fakeUsers[k]] = null;
                    this.setState({users: users}); 
                }.bind(this, i), i * 1000);
            }.bind(this));
        },
        render: function() {
            return React.DOM.div({id: 'application'},
                UserList({users: _.keys(this.state.users),
                    onSelectContact: this.handleSelectContact}),
                Conversation({messages: this.state.messages[this.state.contact],
                    contact: this.state.contact,
                    onRequestKeys: this.handleRequestKeys}));
        }
    });

    return Application;
});

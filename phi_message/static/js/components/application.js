define(['react', 'underscore'], function(React, _) {

    var UserList = React.createClass({
        render: function() {
            return React.DOM.div({},
                React.DOM.h2({}, "Online Users"),
                React.DOM.ul({id: 'user-list'},
                    _.map(this.props.users, function(user) {
                        return React.DOM.li({key: user},
                            React.DOM.a({href: '#'}, user));
                    })));
        }
    });

    var Application = React.createClass({
        getInitialState: function() {
            return {
                messages: {},
                users: []
            };
        },
        componentDidMount: function() {
            var fakeUsers = ['matt', 'taylor', 'chris', 'daniel'];
            _.each(fakeUsers, function(user, i) {
                setTimeout(function(k) {
                    var users = this.state.users;
                    users.push(fakeUsers[k]);
                    this.setState({users: users}); 
                }.bind(this, i), i * 1000);
            }.bind(this));
        },
        render: function() {
            return React.DOM.div({id: 'application'},
                UserList({users: this.state.users}));
        }
    });

    return Application;
});

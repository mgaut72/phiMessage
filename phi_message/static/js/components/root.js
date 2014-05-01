define(['react', 'session', 'components/keygen'], function(React, Session, KeyGenerationWizard) {

    var Header = React.createClass({
        render: function() {
            return React.DOM.header({},
                React.DOM.h1({}, "\u03C6-Message"));
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
                React.DOM.p({}, "Welcome to \u03C6-Message! Please log in!"),
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
                    content = KeyGenerationWizard({username: this.state.username});
            } else
                content = Login({onLogin: this.handleLogin});

            return React.DOM.div({},
                Header(),
                content);
        }
    });
});

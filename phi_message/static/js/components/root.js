define(['react', 'session', 'components/keygen'], function(React, Session, KeyGenerationWizard) {

    var Header = React.createClass({
        render: function() {
            return React.DOM.header({},
                React.DOM.h1({}, React.DOM.span({className: 'hidden'}, "\uD835\uDF11"), "message"));
        }
    });

    var LoginForm = React.createClass({
        getInitialState: function() {
            return {
                username: ''
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
                React.DOM.button({className: 'btn btn-primary'}, "Login"));
        }
    });

    var Login = React.createClass({
        render: function() {
            return React.DOM.div({},
                React.DOM.p({}, "Welcome to \uD835\uDF11message! What's your name?"),
                LoginForm({onLogin: this.props.onLogin}));
        }
    });

    return React.createClass({
        getInitialState: function() {
            return {
                session: Session.getSession()
            };
        },
        handleLogin: function(username) {
            this.setState({
                session: {username: username}
            });
        },
        handleFinishGenerate: function() {
            console.log('root.saveKeys');
            this.setState({session: Session.getSession()});
        },
        render: function() {
            var content;
            if (this.state.session) {
                if (this.state.session.keys)
                    content = React.DOM.div({},
                        "Welcome, " + this.state.session.username);
                else
                    content = KeyGenerationWizard({
                        username: this.state.session.username,
                        onFinish: this.handleFinishGenerate});
            } else
                content = Login({onLogin: this.handleLogin});

            return React.DOM.div({id: 'application'},
                Header(),
                React.DOM.div({id: 'content'}, content));
        }
    });
});

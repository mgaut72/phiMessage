define(['react'], function(React) {

    var KeyField = React.createClass({
        render: function() {
            var className = 'key-field ';
            if(this.props.type){
                className += this.props.type;
            }
            return React.DOM.div({className: 'form-group'},
                React.DOM.label({className: 'col-sm-1 control-label'}, this.props.name),
                React.DOM.div({className: 'col-sm-10'},
                    React.DOM.input({className: 'form-control ' + className, value: this.props.content, readOnly: true})));
        }
    });
    
    return KeyField;

});

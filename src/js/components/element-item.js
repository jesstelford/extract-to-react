import React from 'react';

export default React.createClass({

  propTypes: {
    className: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    checked: React.PropTypes.bool.isRequired,
    onNameChange: React.PropTypes.func.isRequired,
    onCheckChange: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      name: this.props.name,
      checked: this.props.checked
    };
  },

  componentWillReceiveProps(newProps) {
    this.setState({
      name: newProps.name,
      checked: newProps.checked
    });
  },

  handleCheckboxChange(event) {
    let checked = !!event.target.checked;
    this.setState({checked});
    this.props.onCheckChange(checked);
  },

  handleNameChange(event) {
    let name = event.target.value;
    this.setState({name});
    this.props.onNameChange(name);
  },

  render() {
    return (
      <div className={this.props.className}>
        <input
          type='checkbox'
          checked={this.state.checked}
          onChange={this.handleCheckboxChange}
        />
        <input
          type='text'
          value={this.state.name}
          disabled={!this.state.checked}
          onChange={this.handleNameChange}
        />
      </div>
    );
  }
});

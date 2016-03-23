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
      checked: this.props.checked,
      autoFocus: false
    };
  },

  componentWillReceiveProps(newProps) {

    let state = {
      name: newProps.name,
      checked: newProps.checked
    };

    if (newProps.checked && !this.props.checked) {
      state.autoFocus = true;
    }

    this.setState(state);
  },

  setChecked(checked) {
    this.setState({checked});
    this.props.onCheckChange(checked);
  },

  handleDisabledInputClick() {
    this.setChecked(true);
  },

  handleCheckboxChange(event) {
    this.setChecked(!!event.target.checked);
  },

  handleNameChange(event) {
    let name = event.target.value;
    this.setState({name});
    this.props.onNameChange(name);
  },

  render() {
    let extraInputProps = {}

    if (!this.state.checked) {
      extraInputProps.onClick = this.handleDisabledInputClick;
    }

    if (this.state.autoFocus) {
      extraInputProps.ref = input => {
        if (input) {
          input.select();
          input.focus();
          this.setState({autoFocus: false});
        }
      }
    }

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
          {...extraInputProps}
        />
      </div>
    );
  }
});

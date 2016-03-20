import omit from 'lodash/omit';
import React from 'react';
import {TreeMenu} from 'react-tree-menu';
import ElementItem from './element-item';
import reactComponentName from '../tools/react-component-name';

//[
//  {
//    id: "0",
//    children: [
//      {
//        id: "0.0",
//      },
//      {
//        id: "0.1",
//      }
//    ]
//  },
//  {
//    id: "1",
//    children: [
//      {
//        id: "1.1",
//      }
//    ]
//  }
//]
//
//lineage=[1, 1];

function findElement(collection, lineage) {
  let element = null;
  lineage.forEach(index => {
    if (Object.prototype.toString.call(collection) === '[object Array]') {
      element = collection[index];
      collection = element.children;
    }
  });
  return element;
}

// HOC changing labels to inputs and adding change handlers
let ElementList = React.createClass({

  propTypes: {
    data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  },

  getDefaultProps() {
    return {
      onCollapseChange: _=>{},
      onCheckChange: _=>{}
    }
  },

  getInitialState() {
    return {
      data: this.props.data
    }
  },

  componentWillReceiveProps({data}) {
    this.setState({data});
  },

  render() {

    let {
          labelFactory,
          checkboxFactory,
          onCollapseChange
        } = this.props,
        props = omit(
          this.props,
          ['labelFactory', 'checkboxFactory', 'onCollapseChange']
        );

    if (process.env.NODE_ENV !== 'production') {
      if (labelFactory) {
        throw new Error('TreeMenu.labelFactory is overwitten by the HOC ElementList');
      }

      if (checkboxFactory) {
        throw new Error('TreeMenu.checkboxFactory is overwitten by the HOC ElementList');
      }
    }

    props.labelFactory = (className, {name, checked}, lineage) => {
      return (
        <ElementItem
          className={className}
          name={name}
          checked={checked}
          onNameChange={value => {
            let element = findElement(this.state.data, lineage);
            // Clean up the name to be a valid React Component Name
            value = reactComponentName(value);
            element.label.name = value
            this.setState({data: this.state.data});
          }}
          onCheckChange={checked => {
            let element = findElement(this.state.data, lineage);
            element.label.checked = checked;
            this.setState({data: this.state.data});
          }}
        />
      );
    };

    props.onTreeNodeCollapseChange = lineage => {
      let element = findElement(this.state.data, lineage);
      // toggle the checked state
      element.collapsed = !element.collapsed;
      this.setState({data: this.state.data});
      onCollapseChange(element.collapsed, lineage);
    };

    props.checkboxFactory = _ => false;

    if (!props.onTreeNodeClick) {
      // default is to console.log :(
      props.onTreeNodeClick = _=>{};
    }

    return <TreeMenu {...props} />;
  }
});

export default ElementList;

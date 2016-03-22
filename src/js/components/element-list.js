import omit from 'lodash/omit';
import React from 'react';
import {TreeMenu} from 'react-tree-menu';
import ElementItem from './element-item';
import lineageSearch from '../tools/lineage-search';
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


function getElementCopy(collection, lineage) {

  let element = lineageSearch(collection, lineage);

  if (element) {
    let result = Object.assign({}, element);
    result.label = Object.assign({}, element.label);
    return result;
  } else {
    return element;
  }
}

// HOC changing labels to inputs and adding change handlers
let ElementList = React.createClass({

  propTypes: {
    data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onDataChange: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      onCollapseChange: _=>{},
      onCheckChange: _=>{},
      onDataChange: _=>{}
    }
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
            let element = getElementCopy(this.props.data, lineage);
            // Clean up the name to be a valid React Component Name
            value = reactComponentName(value);
            element.label.name = value
            this.props.onDataChange(lineage, element);
          }}
          onCheckChange={checked => {
            let element = getElementCopy(this.props.data, lineage);
            element.label.checked = checked;
            this.props.onDataChange(lineage, element);
          }}
        />
      );
    };

    props.onTreeNodeCollapseChange = lineage => {
      let element = getElementCopy(this.props.data, lineage);
      // toggle the checked state
      element.collapsed = !element.collapsed;
      onCollapseChange(element.collapsed, lineage);
      this.props.onDataChange(lineage, element);
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

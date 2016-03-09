import React from 'react';
import Usage from './usage';
import Footer from './footer';
import Extractor from './extractor';
import AdvancedUsage from './advanced-usage';

let Panel = React.createClass({

  propTypes: {
    inspected: React.PropTypes.shape({
      url: React.PropTypes.string,
      html: React.PropTypes.string,
      css: React.PropTypes.string
    }),
    isLoading: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      inspected: {
        html: '',
        css: '',
        url: ''
      }
    }
  },

  render() {
    return (
      <div>
        <Extractor
          inspected={this.props.inspected}
          isLoading={this.props.isLoading}
        />
        <Usage />
        <AdvancedUsage />
        <hr />
        <Footer />
      </div>
    );
  }
});

export default Panel;

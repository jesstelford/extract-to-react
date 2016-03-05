import React from 'react';
import Usage from './usage';
import Footer from './footer';
import AdvancedUsage from './advanced-usage';

let Panel = React.createClass({
  render() {
    return (
      <div>
        <Usage />
        <AdvancedUsage />
        <hr />
        <Footer />
      </div>
    );
  }
});

export default Panel;

import React from 'react';
import Usage from './usage';
import Footer from './footer';
import ElementList from './element-list';
import lineageSearch from '../tools/lineage-search';
import AdvancedUsage from './advanced-usage';
import nodesToHtmlString from '../tools/nodes-to-html-string';
import {nodeToDataTree, nodesToDataTree} from '../tools/nodes-to-data-tree';
import htmlStringToNodesArray from '../tools/html-string-to-nodes';

var ga = require('../analytics'),
    packageJson = require('../../../package.json'),
    convertToReact = require('../tools/convert-to-react');

const bugUrl = packageJson.bugs.url + '/new';
const errorTitle = encodeURIComponent('Error after extracting');

/**
 * @param name String name to send to GA
 * @param button A DOMNode to add a click listener to
 * @param loadingText [Optional] A string to insert inside the HTML
 * @param buildPostData A function to construct POST data for submitting a
 * form
 */
function linkTrigger(inspected, nodes, name, loadingText, buildPostData) {

  var startTime,
      processingTime,
      errorBody;

  // loadingText is optional
  if (typeof loadingText === 'function' && typeof buildPostData === 'undefined') {
    buildPostData = loadingText;
    loadingText = '';
  }

  ga(
    'send',
    'event',
    'link',
    'click',
    name,
    {
      'nonInteraction': true // Don't count against bounce rate
    }
  );

  var {html: originalHtml, css: originalCss, url: originalUrl} = inspected;

  startTime = performance.now();

  let inspectedAsReact = convertToReact(nodesToHtmlString(nodes), loadingText);
  inspectedAsReact.css = originalCss;

  processingTime = Math.round(performance.now() - startTime);

  ga(
    'send',
    'timing',
    {
      'timingCategory': 'processing',
      'timingVar': 'convert-to-react-complete',
      'timingValue': processingTime,
      'timingLabel': 'Convert To React Complete'
    }
  );

  errorBody = encodeURIComponent(buildErrorReport(originalHtml, originalCss, originalUrl));

  inspectedAsReact.html = inspectedAsReact.html + '\n\n' + generateBugButton(bugUrl + '?title=' + errorTitle + '&body=' + errorBody);

  chrome.runtime.sendMessage({
    post: buildPostData(inspectedAsReact)
  });

}

// Progressively build the error report, keeping it under the `maxLength`
function buildErrorReport(html, css, url, maxLength = 2000) {

  var htmlOut,
      cssOut,
      error;

  error = `**Error**:

\`\`\`
<TODO: Fill in your error>
\`\`\`

**Version**: v${packageJson.version}

**URL**: ${url}`;

  htmlOut = `

**Extracting**:

\`\`\`html
${html}
\`\`\``;

  if (error.length + htmlOut.length > maxLength) {
    return error;
  } else {
    error = error + htmlOut;
  }

  cssOut = `
\`\`\`css
${css}
\`\`\``;

  if (error.length + cssOut.length > maxLength) {
    return error;
  } else {
    error = error + cssOut
  }

  return error;
}

function generateBugButton(url) {
  // TODO: global regex to replace ' with \' in the url string
  return '<button type="button" onclick="window.open(\'' + url.replace(/'/g, "\\'") + '\', \'_blank\')" style="position:absolute; right: 20px; bottom: 20px;">Not working?</button>';
}

let Extractor = React.createClass({

  propTypes: {
    inspected: React.PropTypes.shape({
      url: React.PropTypes.string,
      html: React.PropTypes.string,
      css: React.PropTypes.string
    }).isRequired,
    isLoading: React.PropTypes.bool
  },

  setStateFromProps({inspected: {html}}) {
    let hasInspected = !!html;
    let nodes = htmlStringToNodesArray(html);
    return {
      nodes,
      hasInspected,
      data: hasInspected ? nodesToDataTree(nodes) : []
    }
  },

  getInitialState() {
    return this.setStateFromProps(this.props);
  },

  componentWillReceiveProps(newProps) {
    if (newProps.inspected.html !== this.props.inspected.html) {
      this.setState(this.setStateFromProps(newProps));
    }
  },

  handleCodepen(event) {
    event.stopPropagation();
    event.preventDefault();

    linkTrigger(this.props.inspected, this.state.nodes, 'codepen', function(output) {

      return {
        url: 'http://codepen.io/pen/define',
        data: {
          "data": JSON.stringify({
            html: output.html,
            css: output.css,
            js: output.js,
            js_external: 'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react.min.js;https://cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react-dom.min.js',
            js_pre_processor: 'babel'
          })
        }
      }
    });

  },

  handleDataChange(lineage, element) {

    let indexToUpdate = lineage.pop();
    let collection = this.state.data;

    // if it's not a top level item
    if (lineage.length > 0) {
      collection = lineageSearch(collection, lineage).children;
    }

    collection[indexToUpdate] = element;

    collection[indexToUpdate].node.setAttribute('data-component', element.label.name);

    this.setState({data: this.state.data});

  },

  render() {

    let inspectedContent,
        buttonProps = {};

    if (!this.state.hasInspected) {
      buttonProps.disabled = true;
      inspectedContent = <i>None</i>;
    } else {
      if (this.props.isLoading) {
        inspectedContent = <i>Loading...</i>;
      } else {
        inspectedContent = (
          <ElementList
            data={this.state.data}
            onDataChange={this.handleDataChange}
            expandIconClass='tree-expand-icon'
            collapseIconClass='tree-collapse-icon'
          />
        );
      }
    }

    return (
      <div>
        <p>Inspected Element:</p>
        {inspectedContent}
        <p>Generate and upload to...</p>
        <button {...buttonProps} onClick={this.handleCodepen}>Codepen</button>
      </div>
    );
  }
});

export default Extractor;

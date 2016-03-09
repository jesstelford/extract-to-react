import React from 'react';
import Usage from './usage';
import Footer from './footer';
import AdvancedUsage from './advanced-usage';
import prettyPrintHtml from '../tools/pretty-print-html';

var ga = require('../analytics'),
    packageJson = require('../../../package.json'),
    makeSnapshot = require('../tools/make-snapshot'),
    convertToReact = require('../tools/convert-to-react');

/**
 * @param name String name to send to GA
 * @param button A DOMNode to add a click listener to
 * @param loadingText [Optional] A string to insert inside the HTML
 * @param buildPostData A function to construct POST data for submitting a
 * form
 */
function linkTrigger(name, loadingText, buildPostData) {

  var startTime;

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

  startTime = performance.now();

  makeSnapshot(function(error, output) {

    var processingTime = Math.round(performance.now() - startTime);

    var bugUrl = packageJson.bugs.url + '/new',
        errorTitle = encodeURIComponent('Error after extracting'),
        errorBody;

    if (error) {
      let errorMessage = error.toString() + '\n' + error.stack;
      chrome.runtime.sendMessage({type: 'error', message: errorMessage});

      ga(
        'send',
        'exception',
        {
          'exDescription': errorMessage,
          'exFatal': false
        }
      );

      return;
    }

    ga(
      'send',
      'timing',
      {
        'timingCategory': 'processing',
        'timingVar': 'extracting-complete',
        'timingValue': processingTime,
        'timingLabel': 'Extracting DOM Complete'
      }
    );

    var {html: originalHtml, css: originalCss, url: originalUrl} = output;

    startTime = performance.now();

    output = convertToReact(output, loadingText);

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

    output.html = output.html + '\n\n' + generateBugButton(bugUrl + '?title=' + errorTitle + '&body=' + errorBody);

    chrome.runtime.sendMessage({
      post: buildPostData(output)
    });

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
    }).isRequired
  },

  prepareForRender(html) {
    // TODO: html-entities the html, then return an array of elements to render
    return prettyPrintHtml(html).join('<br />');
  },

  getInitialState() {
    return {
      hasInspected: !!this.props.inspected.html,
      prettyInspected: this.prepareForRender(this.props.inspected.html)
    }
  },

  componentWillReceiveProps(newProps) {
    if (
      newProps.inspected.url !== this.props.inspected.url
      || newProps.inspected.html !== this.props.inspected.html
      || newProps.inspected.css !== this.props.inspected.css
    ) {
      this.setState({
        hasInspected: !!newProps.inspected.html,
        prettyInspected: this.prepareForRender(newProps.inspected.html)
      });
    }
  },

  handleCodepen(event) {
    event.stopPropagation();
    event.preventDefault();

    linkTrigger('codepen', function(output) {

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

  handleJsfiddle() {
    event.stopPropagation();
    event.preventDefault();

    // Note we give instructions to click Run because JSFiddle doesn't correctly
    // execute the JSX post-babel transform on the first (page load) run.
    // Subsequent runs work fine.
    linkTrigger('jsfiddle', 'Click <i>Run</i> to see results', function(output) {

      // Code required to trigger babel conversion of JSX
      var html = output.html
        + '\n\n'
        + '<!-- Trigger babel conversion of JSX -->\n'
        + '<script>document.querySelector(\'script[type="application/javascript;version=1.7"]\').setAttribute(\'type\', \'text/babel\');</script>';

      return {
        url: 'http://jsfiddle.net/api/post/library/pure/',
        data: {
          html: html,
          css: output.css,
          js: output.js,
          resources: 'https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.24/browser.js,https://cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react.min.js,https://cdnjs.cloudflare.com/ajax/libs/react/0.14.6/react-dom.min.js',
          wrap: 'h',// No wrap, in the head
          panel_js: 2 // version 1.7
        }
      }
    });
  },

  render() {

    let inspectedContent = this.state.prettyInspected,
        buttonProps = {};

    if (!this.state.hasInspected) {
      buttonProps.disabled = true;
      inspectedContent = <i>none</i>;
    }

    return (
      <div>
        <p>Inspected Element:</p>
        <pre>
          <code>
            {inspectedContent}
          </code>
        </pre>
        <p>Generate and upload to...</p>
        <button {...buttonProps} onClick={this.handleCodepen}>Codepen</button>
        <button {...buttonProps} onClick={this.handleJsfiddle}>JSFiddle</button>
      </div>
    );
  }
});

export default Extractor;

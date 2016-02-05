window.handleInspected = _ => {}

var he = require('he'),
    ga = require('./analytics'),
    packageJson = require('../../package.json'),
    makeSnapshot = require('./tools/make-snapshot'),
    convertToReact = require('./tools/convert-to-react'),
    prettyPrintHtml = require('./tools/pretty-print-html'),
    htmlStringToNodesArray = require('./tools/html-string-to-nodes');

ga('send', 'pageview', '/panel.html');

//Event listeners
linkTrigger('codepen', document.querySelector('button#codepen'), function(output) {

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

// Note we give instructions to click Run because JSFiddle doesn't correctly
// execute the JSX post-babel transform on the first (page load) run.
// Subsequent runs work fine.
linkTrigger('jsfiddle', document.querySelector('button#jsfiddle'), 'Click <i>Run</i> to see results', function(output) {

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

// Disabled until jsbin supports babel: https://github.com/jsbin/jsbin/pull/2633
/*
linkTrigger('jsbin', document.querySelector('button#jsbin'), function(output) {
  return {
    url: 'http://jsbin.com/?html,css,js,output',
    data: {
      babel: encodeURIComponent(output.js),
      html: encodeURIComponent(output.html),
      css: encodeURIComponent(output.css)
    }
  }
});
*/

/**
 * @param name String name to send to GA
 * @param button A DOMNode to add a click listener to
 * @param loadingText [Optional] A string to insert inside the HTML
 * @param buildPostData A function to construct POST data for submitting a
 * form
 */
function linkTrigger(name, button, loadingText, buildPostData) {

  // loadingText is optional
  if (typeof loadingText === 'function' && typeof buildPostData === 'undefined') {
    buildPostData = loadingText;
    loadingText = '';
  }

  button.addEventListener('click', function (event) {

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

    makeSnapshot(function(error, output) {

      var bugUrl = packageJson.bugs.url + '/new',
          errorTitle = encodeURIComponent('Error after extracting'),
          errorBody;

      if (error) {
        // TODO: Errors
        chrome.runtime.sendMessage({type: 'error', message: error.toString() + '\n' + error.stack});
        return;
      }

      var {html: originalHtml, css: originalCss, url: originalUrl} = output;

      output = convertToReact(output, loadingText);

      errorBody = encodeURIComponent(buildErrorReport(originalHtml, originalCss, originalUrl));

      output.html = output.html + '\n\n' + generateBugButton(bugUrl + '?title=' + errorTitle + '&body=' + errorBody);

      chrome.runtime.sendMessage({
        post: buildPostData(output)
      });

    });

    event.stopPropagation();
    event.preventDefault();
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

function handleInspected() {

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.extract-button')),
      messageEl = document.querySelector('#inspected');

  messageEl.innerHTML = '<i>loading...</i>';
  buttons.forEach(button => {
    button.setAttribute('disabled', 'disabled');
  });

  makeSnapshot(function(error, output) {

    if (error) {
      // TODO: Errors
      chrome.runtime.sendMessage({type: 'error', message: error.toString() + '\n' + error.stack});
      messageEl.innerHTML = '<i>none</i>';
    } else {

      buttons.forEach(button => {
        button.removeAttribute('disabled', 'disabled');
      });

      showInspectedHtml(output.html);
    }

  });
}

function showInspectedHtml(html) {
  document.getElementById('inspected').innerHTML = prettyPrintHtml(html).join('<br />');
}

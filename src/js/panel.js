(function () {
  "use strict";

  window.handleInspected = handleInspected;

  var he = require('he'),
      packageJson = require('../../package.json'),
      makeSnapshot = require('./tools/make-snapshot'),
      convertToReact = require('./tools/convert-to-react'),
      prettyPrintHtml = require('./tools/pretty-print-html'),
      htmlStringToNodesArray = require('./tools/html-string-to-nodes');

  //Event listeners
  linkTrigger(document.querySelector('button#codepen'), function(output) {

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

  linkTrigger(document.querySelector('button#jsfiddle'), function(output) {

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
  linkTrigger(document.querySelector('button#jsbin'), function(output) {
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

  function linkTrigger(button, buildPostData) {

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      makeSnapshot(function(error, output) {

        var originalHtml,
            bugUrl = packageJson.bugs.url + '/new';

        if (error) {
          // TODO: Errors
          chrome.runtime.sendMessage({type: 'error', message: error.toString() + '\n' + error.stack});
          return;
        }

        originalHtml = output.html;

        output = convertToReact(output);

        output.js = '// Not working? Report it here: ' + bugUrl + '?body=' + encodeURIComponent(buildErrorReport(originalHtml)) + '\n\n' + output.js;

        chrome.runtime.sendMessage({
          post: buildPostData(output)
        });

      });
    });

  }

  function buildErrorReport(html) {
    return 'Error when converting:\n\n```html\n' + html + '\n```';
  }

  function handleInspected() {

    makeSnapshot(function(error, output) {

      if (error) {
        // TODO: Errors
        chrome.runtime.sendMessage({type: 'error', message: error});
        return;
      }

      showInspectedHtml(output.html);

    });
  }

  function showInspectedHtml(html) {
    document.getElementById('inspected').innerHTML = prettyPrintHtml(html).join('<br />');
  }

})();

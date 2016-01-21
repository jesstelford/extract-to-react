(function () {
  "use strict";

  const DEFAULT_COMPONENT_NAME = 'Component';

  var Snapshooter = require('./tools/Snapshooter'),
      extractReactComponents = require('html-to-react-components'),
      cssStringifier = new (require('./tools/CSSStringifier')),
      shorthandPropertyFilter = new (require('./filters/ShorthandPropertyFilter')),
      webkitPropertiesFilter = new (require('./filters/WebkitPropertiesFilter')),
      defaultValueFilter = new (require('./filters/DefaultValueFilter')),
      sameRulesCombiner = new (require('./tools/SameRulesCombiner')),
      inspectedContext = new (require('./tools/InspectedContext'));

  var lastSnapshot;

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

        if (error) {
          // TODO: Errors
          chrome.runtime.sendMessage({type: 'error', message: error});
          return;
        }

        chrome.runtime.sendMessage({
          post: buildPostData(output)
        });

      });
    });

  }

  function htmlStringToNodes(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
  }

  function setAttributeToRoot(html, attribute, value) {
    var htmlNode = htmlStringToNodes(html)[0];
    if (!htmlNode.getAttribute(attribute)) {
      htmlNode.setAttribute(attribute, value);
    }
    return htmlNode.outerHTML;
  }

  function isValidPrefix(prefix) {
    var validator = /^[a-z][a-z0-9.\-_:]*$/i;

    return prefix && validator.test(prefix);
  }

  function makeSnapshot(callback) {

    inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
      try {
        lastSnapshot = JSON.parse(result);
        document.getElementById('error').innerHTML = '';
      } catch (e) {
        // TODO: Errors
        chrome.runtime.sendMessage({message: 'parse error: ' + e.message});
        document.getElementById('error').innerHTML = 'DOM snapshot could not be created. Make sure that you have inspected some element.';
        return callback(e);
      }

      try {
        return callback(null, processSnapshot());
      } catch (e) {
        // TODO: Errors
        chrome.runtime.sendMessage({message: 'process error: ' + e.message});
        return callback(e);
      }

    });
  }

  function processSnapshot() {
    if (!lastSnapshot) {
      return;
    }

    var styles = lastSnapshot.css,
      html = lastSnapshot.html,
      js,
      prefix = "",
      idPrefix = (document.getElementById('id-prefix') || {}).value,
      components,
      componentKeys;

    styles = defaultValueFilter.process(styles);
    styles = shorthandPropertyFilter.process(styles);
    styles = webkitPropertiesFilter.process(styles);
    styles = sameRulesCombiner.process(styles);
    styles = cssStringifier.process(styles);

    if (isValidPrefix(idPrefix)) {
      prefix = idPrefix;
    }

    //replacing prefix placeholder used in all IDs with actual prefix
    html = html.replace(/:reacttohtml_prefix:/g, prefix);
    styles = styles.replace(/:reacttohtml_prefix:/g, prefix);

    html = setAttributeToRoot(html, 'data-component', DEFAULT_COMPONENT_NAME);

    components = extractReactComponents(html, {
      componentType: 'es5',
      moduleType: false
    });

    componentKeys = Object.keys(components);

    js = componentKeys.map(key => components[key]).join('\n');

    js += `
ReactDOM.render(
  <${componentKeys[0]} />,
  document.getElementById('container')
);`;

    return {
      html: '<div id="container"></div>',
      js: js,
      css: styles
    };

  }
})();
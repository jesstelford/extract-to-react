(function () {
  "use strict";

  var Snapshooter = require('./tools/Snapshooter'),
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
          css: output.css
        })
      }
    }
  });

  linkTrigger(document.querySelector('button#jsfiddle'), function(output) {
    return {
      url: 'http://jsfiddle.net/api/post/library/pure/',
      data: {
        html: output.html,
        css: output.css
      }
    }
  });

  linkTrigger(document.querySelector('button#jsbin'), function(output) {
    return {
      url: 'http://jsbin.com/?html,css,output',
      data: {
        html: encodeURIComponent(output.html),
        css: encodeURIComponent(output.css)
      }
    }
  });

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
      prefix = "",
      idPrefix = (document.getElementById('id-prefix') || {}).value;

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

    return {
      html: html,
      css: styles
    };

  }
})();

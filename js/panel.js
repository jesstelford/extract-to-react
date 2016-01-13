(function () {
  "use strict";

  chrome.runtime.sendMessage({message: 'start'});

  var lastSnapshot,
    cssStringifier = new CSSStringifier(),
    shorthandPropertyFilter = new ShorthandPropertyFilter(),
    webkitPropertiesFilter = new WebkitPropertiesFilter(),
    defaultValueFilter = new DefaultValueFilter(),
    sameRulesCombiner = new SameRulesCombiner(),
    inspectedContext = new InspectedContext();

  //Event listeners
  var codePenButton = document.querySelector('button#codepen');

  codePenButton.addEventListener('click', function (event) {
    event.stopPropagation();
    event.preventDefault();

    makeSnapshot(function(error, output) {

      if (error) {
        chrome.runtime.sendMessage({type: 'error', message: error});
        return;
      }

      chrome.runtime.sendMessage({message: 'the css'});
      chrome.runtime.sendMessage({message: output.css});
      /* var css = cssStringifier.process(output.css); */
      /* chrome.runtime.sendMessage({message: 'after cssStringify'}); */

      // Usage:
      chrome.runtime.sendMessage({
        post: {
          url: 'http://codepen.io/pen/define',
          data: {"data": JSON.stringify({
            html: 'hi',
            css: 'ho'
          })}
        }
      });

    });
  });
/*
  document.getElementById('jsfiddle-form').addEventListener('submit', function () {
    chrome.runtime.sendMessage({message: 'jsfiddle form value:'});
    var output = makeSnapshot();
    this.querySelector('input[name=html]').value = encodeURIComponent(output.html);
    this.querySelector('input[name=css]').value = encodeURIComponent(cssStringifier.process(output.css));
    chrome.runtime.sendMessage({message: this.querySelector('input[name=html]').value});
    chrome.runtime.sendMessage({message: this.querySelector('input[name=css]').value});
  });

  document.getElementById('jsbin-form').addEventListener('submit', function () {
    chrome.runtime.sendMessage({message: 'jsbin form value:'});
    var output = makeSnapshot();
    this.querySelector('input[name=html]').value = encodeURIComponent(output.html);
    this.querySelector('input[name=css]').value = encodeURIComponent(cssStringifier.process(output.css));
    chrome.runtime.sendMessage({message: this.querySelector('input[name=html]').value});
    chrome.runtime.sendMessage({message: this.querySelector('input[name=css]').value});
  });
*/

  function htmlStringToNodes(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
  }

  function isValidPrefix(prefix) {
    var validator = /^[a-z][a-z0-9.\-_:]*$/i;

    return validator.test(prefix);
  }

  function makeSnapshot(callback) {

    inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
      try {
        lastSnapshot = JSON.parse(result);
        document.getElementById('error').innerHTML = '';
      } catch (e) {
        chrome.runtime.sendMessage({message: 'parse error: ' + e.message});
        document.getElementById('error').innerHTML = 'DOM snapshot could not be created. Make sure that you have inspected some element.';
        return callback(e);
      }

      try {
        return callback(null, processSnapshot());
      } catch (e) {
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
    /* html = htmlStringToNodes(html)[0].outerHTML.replace(/:reacttohtml_prefix:/g, prefix); */
    /* styles = styles.replace(/:reacttohtml_prefix:/g, prefix); */

    return {
      html: html,
      css: styles
    };

  }
})();

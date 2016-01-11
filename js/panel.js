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

  document.getElementById('create').addEventListener('click', makeSnapshot);

  function isValidPrefix(prefix) {
    var validator = /^[a-z][a-z0-9.\-_:]*$/i;

    return validator.test(prefix);
  }

  function makeSnapshot() {

    chrome.runtime.sendMessage({message: 'clicked'});

    inspectedContext.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
      try {
        chrome.runtime.sendMessage({message: 'result: ' + result});
        lastSnapshot = JSON.parse(result);
        document.getElementById('error').innerHTML = '';
      } catch (e) {
        chrome.runtime.sendMessage({message: 'parse error: ' + e.message});
        document.getElementById('error').innerHTML = 'DOM snapshot could not be created. Make sure that you have inspected some element.';
        return;
      }

      try {
        processSnapshot();
      } catch (e) {
        chrome.runtime.sendMessage({message: 'process error: ' + e.message});
      }

    });
  }

  function processSnapshot() {
    if (!lastSnapshot) {
      return;
    }

    chrome.runtime.sendMessage({message: 'processing'});

    var styles = lastSnapshot.css,
      html = lastSnapshot.html,
      prefix = "",
      idPrefix = (document.getElementById('id-prefix') || {}).value;

    chrome.runtime.sendMessage({message: 'processing styles'});

    styles = defaultValueFilter.process(styles);
    styles = shorthandPropertyFilter.process(styles);
    styles = webkitPropertiesFilter.process(styles);
    styles = sameRulesCombiner.process(styles);
    /* styles = cssStringifier.process(styles); */

    if (isValidPrefix(idPrefix)) {
      prefix = idPrefix;
    }

    chrome.runtime.sendMessage({message: 'replacing prefixes'});

    //replacing prefix placeholder used in all IDs with actual prefix
    html = html.replace(/:reacttohtml_prefix:/g, prefix);
    /* styles = styles.replace(/:reacttohtml_prefix:/g, prefix); */

    chrome.runtime.sendMessage({
      type: 'html',
      message: html
    });

    chrome.runtime.sendMessage({
      type: 'css',
      message: styles
    });

  }
})();

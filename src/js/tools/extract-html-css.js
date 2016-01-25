var cssStringifier = new (require('./CSSStringifier')),
    shorthandPropertyFilter = new (require('../filters/ShorthandPropertyFilter')),
    webkitPropertiesFilter = new (require('../filters/WebkitPropertiesFilter')),
    defaultValueFilter = new (require('../filters/DefaultValueFilter')),
    sameRulesCombiner = new (require('./SameRulesCombiner'));

function isValidPrefix(prefix) {
  var validator = /^[a-z][a-z0-9.\-_:]*$/i;

  return prefix && validator.test(prefix);
}

module.exports = function extractHtmlCss({html = '', css = ''} = {}, idPrefix = '') {
  var prefix = "";

  css = defaultValueFilter.process(css);
  css = shorthandPropertyFilter.process(css);
  css = webkitPropertiesFilter.process(css);
  css = sameRulesCombiner.process(css);
  css = cssStringifier.process(css);

  if (isValidPrefix(idPrefix)) {
    prefix = idPrefix;
  }

  //replacing prefix placeholder used in all IDs with actual prefix
  html = html.replace(/:reacttohtml_prefix:/g, prefix);
  css = css.replace(/:reacttohtml_prefix:/g, prefix);

  return {html, css};

}
